import {Pricing} from "pricing4ts";
import { Pricing as PricingModel } from "../types/database/Pricing";
import container from "../config/container";
import { processFileUris } from "./FileService";
import { PricingService as PricingAnalytics, retrievePricingFromPath } from "pricing4ts/server";
import { PricingIndexQueryParams } from "../types/services/PricingService";
import PricingCollectionService from "./PricingCollectionService";
import PricingRepository from "../repositories/mongoose/PricingRepository";
import CacheService from "./CacheService";

class PricingService {
    
    private pricingRepository: PricingRepository;
    private pricingCollectionService: PricingCollectionService;
    private cacheService: CacheService;

    constructor () {
      this.pricingRepository = container.resolve('pricingRepository');
      this.pricingCollectionService = container.resolve('pricingCollectionService');
      this.cacheService = container.resolve('cacheService');
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

    async getConfigurationSpace (pricingId: string, queryParams?: {limit?: string, offset?: string}) {

      // Validations
      if (queryParams?.limit && !/^\d+$/.test(queryParams.limit)) {
        throw new Error('Invalid limit parameter, it must be a numeric value');
      }

      if (queryParams?.offset && !/^\d+$/.test(queryParams.offset)) {
        throw new Error('Invalid offset parameter, it must be a numeric value');
      }

      const formattedQueryParams = {
        limit: queryParams?.limit ? parseInt(queryParams.limit) : undefined,
        offset: queryParams?.offset ? parseInt(queryParams.offset) : undefined
      }
      
      const retrievedPricing = await this.pricingRepository.findById(pricingId)
      if (!retrievedPricing) {
        throw new Error('Pricing not found')
      }

      if (!process.env.SERVER_STATICS_FOLDER){
        throw new Error('SERVER_STATICS_FOLDER env not set')
      }

      let configurationSpace = null;
      const key: string = "configurationSpace:" + pricingId;
      const cachedConfigurationSpace = await this.cacheService.get(key);

      if (cachedConfigurationSpace) {
        configurationSpace = cachedConfigurationSpace;
      }else{
        // Configuariton space calculation
        const pricingInfo: Pricing = retrievePricingFromPath(process.env.SERVER_STATICS_FOLDER + retrievedPricing.yaml);
        const pricingAnalytics = new PricingAnalytics(pricingInfo);
        configurationSpace = await pricingAnalytics.getConfigurationSpace();
        await this.cacheService.set(key, configurationSpace, 60 * 60 * 24);
      }
      
      // Pagination
      const startPaginationIndex = formattedQueryParams.offset ? formattedQueryParams.offset : 0;
      const endPaginationIndex = formattedQueryParams.limit ? startPaginationIndex + formattedQueryParams.limit : configurationSpace.length;

      return [configurationSpace.slice(startPaginationIndex, endPaginationIndex), configurationSpace.length];
    }

    async create (pricingFile: any, owner: string, collectionId?: string) {
      try{
        const uploadedPricing: Pricing = retrievePricingFromPath(typeof pricingFile === "string" ? pricingFile : pricingFile.path);
        // TODO: if the pricing exists in two or more collections, this could lead to error.
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

        processFileUris(pricing[0], ['yaml'])

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
  
    async destroy (pricingName: string, owner: string, queryParams?: {collectionName?: string}) {

      let collectionId;

      if (queryParams?.collectionName) {
        const collection = await this.pricingCollectionService.showByNameAndUserId(queryParams.collectionName, owner)
        if (!collection) {
          throw new Error('Collection not found')
        }

        collectionId = collection._id.toString()
      }

      const result = await this.pricingRepository.destroyByNameOwnerAndCollectionId(pricingName, owner, collectionId)
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
  