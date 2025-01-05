import container from "../config/container";
import { Pricing } from "../types/database/Pricing";
import { PricingRepository } from "../types/repositories/PricingRepository";
import { processFileUris } from "./FileService";

class PricingService {
    
    private pricingRepository: PricingRepository;

    constructor () {
      this.pricingRepository = container.resolve('pricingRepository');
    }

    async index () {
      const pricings = await this.pricingRepository.findAll()
      return pricings
    }
  
    async show (name: string) {
      const pricing: {name: string, versions: Pricing[]} | null = await this.pricingRepository.findByName(name)
      if (!pricing) {
        throw new Error('Pricing not found')
      }
      for (const version of pricing.versions) {
        processFileUris(version, ['yaml'])
      }
      const pricingObject = Object.assign({}, pricing)
      return pricingObject
    }
  
    async destroy (id: string) {
      const result = await this.pricingRepository.destroy(id)
      if (!result) {
        throw new Error('Pricing not found')
      }
      return true
    }
  }
  
  export default PricingService
  