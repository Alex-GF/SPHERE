import mongoose from "mongoose";
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

    async create (newCollection: any, userId: string) {
      try{
        newCollection._ownerId = new mongoose.Types.ObjectId(userId);
        newCollection.analytics = {
          evolutionOfPlans: {
            dates: [],
            values: []
          },
          evolutionOfAddOns: {
            dates: [],
            values: []
          },
          evolutionOfFeatures: {
            dates: [],
            values: []
          },
          evolutionOfConfigurationSpaceSize: {
            dates: [],
            values: []
          },
        }

        const collection = await this.pricingCollectionRepository.create(newCollection);

        return collection;
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
  
  export default PricingCollectionService
  