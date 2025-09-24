import mongoose from 'mongoose';
import container from '../config/container';
import PricingCollectionRepository from '../repositories/mongoose/PricingCollectionRepository';
import PricingRepository from '../repositories/mongoose/PricingRepository';
import { RetrievedCollection } from '../types/database/PricingCollection';
import { CollectionIndexQueryParams } from '../types/services/PricingCollection';
import { decompressZip } from '../utils/zip-manager';
import {  PricingService as PricingAnalytics, retrievePricingFromPath } from 'pricing4ts/server';
import fs from 'fs';
import { calculateAnalyticsForPricings } from '../utils/pricing-collections-utils';

class PricingCollectionService {
  private readonly pricingCollectionRepository: PricingCollectionRepository;
  private readonly pricingRepository: PricingRepository;

  constructor() {
  this.pricingCollectionRepository = container.resolve('pricingCollectionRepository');
  this.pricingRepository = container.resolve('pricingRepository');
  }

  async index(queryParams: CollectionIndexQueryParams) {
    const result = await this.pricingCollectionRepository.findAll(queryParams);
    // result is { collections, total }
    return result;
  }

  async showByNameAndUserId(name: string, userId: string) {
    const collection = await this.pricingCollectionRepository.findByNameAndUserId(name, userId);
    if (!collection) {
      throw new Error('Pricing collection not found');
    }

    return collection;
  }

  async showByUserId(userId: string) {
    const collections = await this.pricingCollectionRepository.findByUserId(userId);

    return collections;
  }

  async show(userId: string) {
    const collection = await this.pricingCollectionRepository.findByUserId(userId);
    if (!collection) {
      throw new Error('Pricing collection not found');
    }

    return collection;
  }

  async create(newCollection: any, userId: string, username: string) {
    let collection: any;
    try {
      newCollection._ownerId = new mongoose.Types.ObjectId(userId);
      newCollection.analytics = {
        evolutionOfPlans: {
          dates: [],
          values: [],
        },
        evolutionOfAddOns: {
          dates: [],
          values: [],
        },
        evolutionOfFeatures: {
          dates: [],
          values: [],
        },
        evolutionOfConfigurationSpaceSize: {
          dates: [],
          values: [],
        },
      };

      collection = await this.pricingCollectionRepository.create(newCollection);

      await this.pricingRepository.addPricingsToCollection(
        collection._id.toString(),
        username,
        newCollection.pricings
      );

      await this.updateCollectionAnalytics(collection._id.toString());

      return collection;
    } catch (err) {
      await this._handleCollectionCreationError(err as Error, collection, newCollection, userId);
    }
  }

  async bulkCreate(file: any, newCollectionData: any, userId: string, username: string) {
  let collection: any;
    try {
      const extractPath = this._getExtractPath(userId, newCollectionData.name);
      const zipPath = file.path;

      const extractedFiles = await decompressZip(zipPath, extractPath);

      newCollectionData._ownerId = new mongoose.Types.ObjectId(userId);

  // Create collection and keep reference so we only attempt cleanup if it was created
  collection = await this.pricingCollectionRepository.create(newCollectionData);

      const pricingDatas = [];
      const pricingsWithErrors = [];
      for (const pricing of extractedFiles) {
        if (!(pricing.endsWith('.yaml') || pricing.endsWith('.yml'))) {
          continue
        }
        try{
          const uploadedPricing = retrievePricingFromPath(pricing);
          const pricingAnalytics = new PricingAnalytics(uploadedPricing);
  
            const pricingData = {
            name: uploadedPricing.saasName.split(" ")[0].charAt(0).toUpperCase() + uploadedPricing.saasName.split(" ")[0].slice(1).toLowerCase(),
            version: uploadedPricing.version,
            _collectionId: collection._id,
            owner: username,
            currency: uploadedPricing.currency,
            extractionDate: new Date(uploadedPricing.createdAt),
            url: '',
            yaml: pricing.split('/').slice(1).join('/'),
            analytics: await pricingAnalytics.getAnalytics(),
            };
          pricingDatas.push(pricingData);
        }catch(err){
          pricingsWithErrors.push({
            name: `${pricing.split("/")[pricing.split("/").length - 2]}/${pricing.split("/")[pricing.split("/").length - 1]}`,
            error: err,
          });
        }
      }

      await this.pricingRepository.create(pricingDatas);

      await this.updateCollectionAnalytics(collection._id.toString());

      return [collection, pricingsWithErrors];
    } catch(err) {
      throw await this._handleCollectionCreationError(err as Error, collection, newCollectionData, userId);
    }
  }

  async generateCollectionAnalytics(collectionName: string, ownerId: string) {
    try{
      const collectionPricings = await this.pricingCollectionRepository.findCollectionPricings(collectionName, ownerId);
      if (!collectionPricings) {
        throw new Error('Collection not found');
      }

      const analytics = calculateAnalyticsForPricings(collectionPricings.pricings);
      
      await this.pricingCollectionRepository.setCollectionAnalytics(collectionPricings._id, analytics);
      return true;
    }catch(err){
      throw new Error((err as Error).message);
    }
  }

  async update(collectionName: string, ownerId: string, data: any) {
    const collection = await this.pricingCollectionRepository.findByNameAndUserId(
      collectionName,
      ownerId
    );
    if (!collection) {
      throw new Error('Either the collection does not exist or you are not its owner');
    }

    await this.pricingCollectionRepository.update(collection._id.toString(), data);

    const updatedCollection = await this.pricingCollectionRepository.findById(collection._id.toString());

    if (updatedCollection.name !== collectionName) {
      fs.renameSync(
        this._getExtractPath(ownerId, collectionName),
        this._getExtractPath(ownerId, updatedCollection.name)
      );
    }

    return updatedCollection;
  }

  async updateCollectionAnalytics(collectionId: string) {
    const collection = await this.pricingCollectionRepository.findById(collectionId);

    if (!collection) {
      throw new Error('Pricing collection not found');
    }

    const newAnalyticsEntry = this._computeCollectionAnalytics(collection);

    await this.pricingCollectionRepository.updateAnalytics(collection._id, newAnalyticsEntry);
  }

  async destroy(collectionName: string, ownerId: string, deleteCascade: boolean, ignoreResult: boolean = false) {
    const collection = await this.pricingCollectionRepository.findByNameAndUserId(
      collectionName,
      ownerId
    );
    if (!collection) {
      throw new Error('Either the collection does not exist or you are not its owner');
    }

    let result;

    if (deleteCascade) {
      result = await this.pricingCollectionRepository.destroyWithPricings(
        collection._id.toString()
      );
      
      fs.rmdirSync(this._getExtractPath(ownerId, collectionName), { recursive: true });
    } else {
      await this.pricingRepository.removePricingsFromCollection(collection._id.toString());
      result = await this.pricingCollectionRepository.destroy(collection._id.toString());
    }

    if (!result && !ignoreResult) {
      throw new Error('Collection not found');
    }

    return true;
  }

  _computeCollectionAnalytics(collection: RetrievedCollection) {
    const collectionPricings = collection.pricings[0].pricings;
    const numberOfPricings = collectionPricings.length;
    if (collectionPricings.length === 0) return null;

    // Compute the new average analytics
    const aggregated = collectionPricings.reduce(
      (acc: any, pricing: any) => {
        acc.numberOfPlans += pricing.analytics.numberOfPlans / numberOfPricings;
        acc.numberOfAddOns += pricing.analytics.numberOfAddOns / numberOfPricings;
        acc.configurationSpaceSize += pricing.analytics.configurationSpaceSize / numberOfPricings;
        acc.numberOfFeatures += pricing.analytics.numberOfFeatures / numberOfPricings;
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
      evolutionOfConfigurationSpaceSize: {
        date: currentDate,
        value: aggregated.configurationSpaceSize,
      },
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

  _getExtractPath(userId: string, collectionName: string) {
    return `${process.env.COLLECTIONS_FOLDER}/${userId}/${collectionName}`;
  }

  async _handleCollectionCreationError(err: Error, collection: any, newCollectionData: any, userId: string): Promise<Error> {
    // If a collection was created before the error, remove it (cleanup of partial state)
      try {
        if (collection?._id) {
          await this.destroy(newCollectionData.name, userId, true, true);
        }
      } catch (cleanupErr) {
        // If cleanup fails, log it but continue to throw the original error
        // eslint-disable-next-line no-console
        console.error('Error during cleanup after bulkCreate failure:', cleanupErr);
      }

      const errMsg = (err as any)?.message || String(err);

      // Detect duplicate key / already exists errors and surface a clear message
      if (errMsg.includes('E11000') || errMsg.toLowerCase().includes('duplicate') || errMsg.toLowerCase().includes('already exists')) {
        throw new Error('A collection with this name already exists. Please choose another name.');
      }

      throw new Error(errMsg);
  }
}

export default PricingCollectionService;
