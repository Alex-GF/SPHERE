import container from "../config/container";
import PricingCollectionRepository from "../repositories/mongoose/PricingCollectionRepository";

class PricingCollectionService {
    
    private pricingCollectionRepository: PricingCollectionRepository;

    constructor () {
      this.pricingCollectionRepository = container.resolve('pricingCollectionRepository');
    }

    async index () {
      const pricings = await this.pricingCollectionRepository.findAll()
      return pricings
    }

    async showByNameAndUserId (name: string, userId: string) {
      const collection = await this.pricingCollectionRepository.findByNameAndUserId(name, userId);
      if (!collection) {
        throw new Error('Pricing collection not found')
      }
      
      return collection;
    }

    async showByUserId (userId: string) {
      const collections = await this.pricingCollectionRepository.findByUserId(userId);
      
      return collections;
    }
  
    async show (userId: string) {
      const collection = await this.pricingCollectionRepository.findByUserId(userId);
      if (!collection) {
        throw new Error('Pricing collection not found')
      }
      
      return collection;
    }

    async create (pricingFile: any, owner: string) {
      // try{
      //   const uploadedPricing: Pricing = retrievePricingFromPath(pricingFile.path);
        
      //   const pricingData = {
      //     name: uploadedPricing.saasName,
      //     version: uploadedPricing.version,
      //     owner: owner,
      //     currency: uploadedPricing.currency,
      //     extractionDate: new Date(uploadedPricing.createdAt),
      //     url: '',
      //     yaml: pricingFile.path.split('/').slice(1).join('/'),
      //     analytics: {}
      //   };

      //   const pricing = await this.pricingRepository.create(pricingData);

      //   processFileUris(pricing, ['yaml'])

      //   const pricingAnalytics = new PricingAnalytics(uploadedPricing);

      //   await pricingAnalytics.getAnalytics()
      //     .then((analytics: any) => {
      //       this.pricingRepository.updateAnalytics(pricing.id, analytics);
      //     }).catch(async (err: any) => {
      //       await this.pricingRepository.destroy(pricing.id);
      //       throw new Error((err as Error).message);
      //     });

      //   return pricing;
      // }catch(err){
      //   throw new Error((err as Error).message);
      // }

    }
  
    // async destroy (id: string) {
    //   const result = await this.pricingRepository.destroy(id)
    //   if (!result) {
    //     throw new Error('Pricing not found')
    //   }
    //   return true
    // }
  }
  
  export default PricingCollectionService
  