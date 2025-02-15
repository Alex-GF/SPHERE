import { Pricing } from "pricing4ts";
import { Pricing as PricingModel } from "../types/database/Pricing";
import container from "../config/container";
import { PricingRepository } from "../types/repositories/PricingRepository";
import { processFileUris } from "./FileService";
import { PricingService as PricingAnalytics, retrievePricingFromPath } from "pricing4ts/server";
import { PricingIndexQueryParams } from "../types/services/PricingService";
import PricingCollectionService from "./PricingCollectionService";
import { th } from "@faker-js/faker";

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
  
    async show (name: string, owner: string) {
      const pricing: {name: string, versions: PricingModel[]} | null = await this.pricingRepository.findByNameAndOwner(name, owner)
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
        const uploadedPricing: Pricing = retrievePricingFromPath(pricingFile.path);
        
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

        const pricing = await this.pricingRepository.create(pricingData);

        processFileUris(pricing, ['yaml'])

        const pricingAnalytics = new PricingAnalytics(uploadedPricing);

        await pricingAnalytics.getAnalytics()
          .then((analytics: any) => {
            this.pricingRepository.updateAnalytics(pricing.id, analytics);
          }).catch(async (err: any) => {
            await this.pricingRepository.destroy(pricing.id);
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
  }
  
  export default PricingService
  