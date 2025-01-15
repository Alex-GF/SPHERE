import { Pricing } from "pricing4ts";
import { Pricing as PricingModel } from "../types/database/Pricing";
import container from "../config/container";
import { PricingRepository } from "../types/repositories/PricingRepository";
import { processFileUris } from "./FileService";
import { PricingService as PricingAnalytics, retrievePricingFromPath } from "pricing4ts/server";
import { PricingIndexQueryParams } from "../types/services/PricingService";

class PricingService {
    
    private pricingRepository: PricingRepository;

    constructor () {
      this.pricingRepository = container.resolve('pricingRepository');
    }

    async index (queryParams: PricingIndexQueryParams) {
      const pricings = await this.pricingRepository.findAll(queryParams)
      return pricings
    }
  
    async show (name: string) {
      const pricing: {name: string, versions: PricingModel[]} | null = await this.pricingRepository.findByName(name)
      if (!pricing) {
        throw new Error('Pricing not found')
      }
      for (const version of pricing.versions) {
        processFileUris(version, ['yaml'])
      }
      const pricingObject = Object.assign({}, pricing)
      return pricingObject
    }

    async create (pricingFile: any) {
      try{
        const uploadedPricing: Pricing = retrievePricingFromPath(pricingFile.path);
        
        const pricingData = {
          name: uploadedPricing.saasName,
          version: uploadedPricing.version,
          extractionDate: new Date(uploadedPricing.createdAt),
          url: '',
          yaml: pricingFile.path.split('/').slice(1).join('/'),
          analytics: {}
        };

        const pricing = await this.pricingRepository.create(pricingData);

        processFileUris(pricing, ['yaml'])

        const pricingAnalytics = new PricingAnalytics(uploadedPricing);

        pricingAnalytics.getAnalytics()
          .then((analytics) => {
            this.pricingRepository.updateAnalytics(pricing.id, analytics);
          });

        return pricing;
      }catch(err){
        throw new Error((err as Error).message);
      }

    }
  
    // async destroy (id: string) {
    //   const result = await this.pricingRepository.destroy(id)
    //   if (!result) {
    //     throw new Error('Pricing not found')
    //   }
    //   return true
    // }
  }
  
  export default PricingService
  