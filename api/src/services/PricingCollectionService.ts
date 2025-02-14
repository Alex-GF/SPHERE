import mongoose from "mongoose";
import container from "../config/container";
import PricingCollectionRepository from "../repositories/mongoose/PricingCollectionRepository";
import PricingRepository from "../repositories/mongoose/PricingRepository";
import { RetrievedCollection } from "../types/database/PricingCollection";
import { CollectionIndexQueryParams } from "../types/services/PricingCollection";

class PricingCollectionService {
    
    private pricingCollectionRepository: PricingCollectionRepository;
    private pricingRepository: PricingRepository;

    constructor () {
      this.pricingCollectionRepository = container.resolve('pricingCollectionRepository');
      this.pricingRepository = container.resolve('pricingRepository');
    }

    async index (queryParams: CollectionIndexQueryParams) {
      const pricings = await this.pricingCollectionRepository.findAll(queryParams)
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

    async create (newCollection: any, userId: string, username: string) {
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

        await this.pricingRepository.addPricingsToCollection(collection._id.toString(), username, newCollection.pricings);

        await this.updateCollectionAnalytics(collection._id.toString());

        return collection;
      }catch(err){
        throw new Error((err as Error).message);
      }
    }

    async updateCollectionAnalytics (collectionId: string) {
      const collection = await this.pricingCollectionRepository.findById(collectionId);
      
      if (!collection) {
        throw new Error('Pricing collection not found')
      }

      const newAnalyticsEntry = this._computeCollectionAnalytics(collection);

      await this.pricingCollectionRepository.updateAnalytics(collection._id, newAnalyticsEntry);
    }

    _computeCollectionAnalytics (collection: RetrievedCollection) {
      const collectionPricings = collection.pricings[0].pricings;
      const numberOfPricings = collectionPricings.length;
      if (collectionPricings.length === 0) return null;

      // Compute the new average analytics
      const aggregated = collectionPricings.reduce(
        (acc: any, pricing: any) => {
          acc.numberOfPlans += pricing.analytics.numberOfPlans/numberOfPricings;
          acc.numberOfAddOns += pricing.analytics.numberOfAddOns/numberOfPricings;
          acc.configurationSpaceSize += pricing.analytics.configurationSpaceSize/numberOfPricings;
          acc.numberOfFeatures += pricing.analytics.numberOfFeatures/numberOfPricings;
          return acc;
        },
        {
          numberOfPlans: 0,
          numberOfAddOns: 0,
          configurationSpaceSize: 0,
          numberOfFeatures: 0,
        }
      );

      const currentDate = new Date().toISOString(); // Sets the current date to dates

      const evolution: any = {
        evolutionOfPlans: { date: currentDate, value: aggregated.numberOfPlans },
        evolutionOfAddOns: { date: currentDate, value: aggregated.numberOfAddOns },
        evolutionOfConfigurationSpaceSize: { date: currentDate, value: aggregated.configurationSpaceSize },
        evolutionOfFeatures: { date: currentDate, value: aggregated.numberOfFeatures },
      };

      return evolution;
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
  