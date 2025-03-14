import {Pricing} from "pricing4ts";
import { Pricing as PricingModel } from "../types/database/Pricing";
import container from "../config/container";
import { processFileUris } from "./FileService";
import { PricingService as PricingAnalytics, retrievePricingFromPath } from "pricing4ts/server";
import { PricingIndexQueryParams } from "../types/services/PricingService";
import PricingCollectionService from "./PricingCollectionService";
import PricingRepository from "../repositories/mongoose/PricingRepository";

class PricingService {
    
    private pricingRepository: PricingRepository;
    private pricingCollectionService: PricingCollectionService;

    constructor () {
      this.pricingRepository = container.resolve('pricingRepository');
      this.pricingCollectionService = container.resolve('pricingCollectionService');
    }

    async index (queryParams: PricingIndexQueryParams) {
      const pricings = await this.pricingRepository.findAll(queryParams)
      return pricings
    }

    async indexByUserWithoutCollection (username: string){
      const pricings = await this.pricingRepository.findByOwnerWithoutCollection(username)
      return pricings
    }
    
    async indexByCollection (collectionId: string){
      const pricings = await this.pricingRepository.findByCollection(collectionId)
      return pricings
    }
  
    async show (name: string, owner: string, queryParams?: {collectionName?: string}) {
      const pricing: {name: string, versions: PricingModel[]} | null = await this.pricingRepository.findByNameAndOwner(name, owner, queryParams)
      if (!pricing) {
        throw new Error('Pricing not found')
      }
      for (const version of pricing.versions) {
        processFileUris(version, ['yaml'])
      }
      const pricingObject = Object.assign({}, pricing)
      return pricingObject
    }

    async create (pricingFile: any, owner: string, collectionId?: string) {
      try{
        const uploadedPricing: Pricing = retrievePricingFromPath(typeof pricingFile === "string" ? pricingFile : pricingFile.path);
        const previousPricing = await this.pricingRepository.findByNameAndOwner(uploadedPricing.saasName, owner);

        if (!collectionId && previousPricing && previousPricing.versions[0]._collectionId) {
          collectionId = previousPricing.versions[0]._collectionId.toString();
        }

        const pricingData = {
          name: uploadedPricing.saasName,
          version: uploadedPricing.version,
          _collectionId: collectionId,
          owner: owner,
          currency: uploadedPricing.currency,
          extractionDate: new Date(uploadedPricing.createdAt),
          url: '',
          yaml: pricingFile.path.split('/').slice(1).join('/'),
          analytics: {}
        };

        const pricing = await this.pricingRepository.create([pricingData]);

        processFileUris(pricing, ['yaml'])

        const pricingAnalytics = new PricingAnalytics(uploadedPricing);

        await pricingAnalytics.getAnalytics()
          .then((analytics: any) => {
            this.pricingRepository.updateAnalytics(pricing[0]._id.toString(), analytics);
          }).catch(async (err: any) => {
            await this.pricingRepository.destroy(pricing[0]._id.toString());
            throw new Error((err as Error).message);
          });

        if (collectionId) {
          await this.pricingCollectionService.updateCollectionAnalytics(collectionId);
        }

        return pricing;
      }catch(err){
        throw new Error((err as Error).message);
      }
    }

    async addPricingToCollection (pricingName: string, owner: string, collectionId: string) {
      try{
        const pricing = await this.pricingRepository.findByNameAndOwner(pricingName, owner);
        if (!pricing) {
          throw new Error('Either the pricing does not exist or you are not its owner');
        }
  
        await this.pricingRepository.addPricingToCollection(pricingName, owner, collectionId);
        await this.pricingCollectionService.updateCollectionAnalytics(collectionId);
  
        return true;
      }catch(err){
        throw new Error((err as Error).message);
      }
    }

    async update (pricingName: string, owner: string, data: any) {
      const pricing = await this.pricingRepository.findByNameAndOwner(pricingName, owner)
      if (!pricing) {
        throw new Error('Either the pricing does not exist or you are not its owner')
      }

      for (const pricingVersion of pricing.versions) {
        await this.pricingRepository.update(pricingVersion.id, data)
      }

      const updatedPricing = await this.pricingRepository.findByNameAndOwner(pricingName, owner)

      return updatedPricing;
    }

    async updatePricingsCollectionName (oldCollectionName: string, newCollectionName: string, collectionId: string, ownerId: string) {
      
      if (oldCollectionName === newCollectionName){
        return true;
      }

      const pricings = await this.pricingRepository.findByCollection(collectionId);
      const pricingsToUpdate = []
      for (const pricing of pricings) {
        if (pricing.yaml.includes(oldCollectionName)){
          pricing.yaml = pricing.yaml.replace(oldCollectionName, newCollectionName)
          pricingsToUpdate.push(pricing)
        }
      }

      await this.pricingRepository.updatePricingsCollectionName(pricingsToUpdate, ownerId, newCollectionName)
      return true
    }

    async removePricingFromCollection (pricingName: string, owner: string) {
      try{
        const pricing = await this.pricingRepository.findByNameAndOwner(pricingName, owner);

        if (!pricing) {
          throw new Error('Either the pricing does not exist or you are not its owner');
        }

        await this.pricingRepository.removePricingFromCollection(pricingName, owner);
        if (pricing.versions[0]._collectionId){
          await this.pricingCollectionService.updateCollectionAnalytics(pricing.versions[0]._collectionId);
        }else{
          throw new Error('Pricing is not in a collection');
        }
  
        return true;
      }catch(err){
        throw new Error((err as Error).message);
      }
    }
  
    async destroy (pricingName: string, owner: string) {
      const result = await this.pricingRepository.destroyByNameAndOwner(pricingName, owner)
      if (!result) {
        throw new Error('Either the pricing does not exist or you are not its owner')
      }
      return true
    }

    async destroyVersion (pricingName: string, pricingVersion: string, owner: string) {
      const result = await this.pricingRepository.destroyVersionByNameAndOwner(pricingName, pricingVersion, owner)

      if (!result) {
        throw new Error('Either the pricing does not exist or you are not its owner')
      }

      return true;
    }
  }
  
  export default PricingService
  