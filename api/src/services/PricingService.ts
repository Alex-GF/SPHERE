import container from "../config/container";
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
  
    async show (id: string) {
      const pricing = await this.pricingRepository.findById(id)
      if (!pricing) {
        throw new Error('Pricing not found')
      }
      processFileUris(pricing, ['yaml'])
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
  