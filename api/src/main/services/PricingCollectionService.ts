import mongoose from 'mongoose';
import container from '../config/container';
import PricingCollectionRepository from '../repositories/mongoose/PricingCollectionRepository';
import PricingRepository from '../repositories/mongoose/PricingRepository';
import { RetrievedCollection } from '../types/database/PricingCollection';
import { CollectionIndexQueryParams } from '../types/services/PricingCollection';
import { decompressZip } from '../utils/zip-manager';
import { PricingService as PricingAnalytics, retrievePricingFromPath } from 'pricing4ts/server';
import fs from 'fs';
import { calculateAnalyticsForPricings } from '../utils/pricing-collections-utils';
import { LeanUser } from '../types/models/User';
import UserService from './UserService';

class PricingCollectionService {
  private readonly pricingCollectionRepository: PricingCollectionRepository;
  private readonly pricingRepository: PricingRepository;
  private readonly userService: UserService;

  constructor() {
    this.pricingCollectionRepository = container.resolve('pricingCollectionRepository');
    this.pricingRepository = container.resolve('pricingRepository');
    this.userService = container.resolve('userService');
  }

  async index(queryParams: CollectionIndexQueryParams) {
    const result = await this.pricingCollectionRepository.findAll(queryParams);
    // result is { collections, total }
    return result;
  }

  async indexByUsername(username: string, reqUser: LeanUser) {
    const user = await this.userService.exists(username);

    if (!user) {
      throw new Error('NOT FOUND: User not found');
    }

    const includePrivate = username === reqUser.username || reqUser.role === 'ADMIN';

    const collections = await this.pricingCollectionRepository.findByUsername(
      username,
      includePrivate
    );

    return collections;
  }

  async show(owner: string, collectionName: string, reqUser: LeanUser) {
    const collection = await this.pricingCollectionRepository.findByOwnerAndName(
      owner,
      collectionName
    );
    if (!collection) {
      throw new Error('NOT FOUND: Pricing collection not found');
    }

    if (collection.private && owner !== reqUser.username && reqUser.role !== 'ADMIN') {
      throw new Error('PERMISSION ERROR: You are not the owner of this private collection');
    }

    collection.analytics = this._normalizeCollectionAnalytics(collection.analytics);

    return collection;
  }

  async create(newCollection: any, owner: string, reqUser: LeanUser) {
    if (owner !== reqUser.username && reqUser.role !== 'ADMIN') {
      throw new Error('PERMISSION ERROR: You can only create collections for yourself');
    }

    let collection: any;
    try {
      newCollection._ownerName = owner;
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

      if (newCollection.pricings && newCollection.pricings.length > 0) {
        await this.pricingRepository.addPricingsToCollection(
          collection.id,
          owner,
          newCollection.pricings
        );

        await this.updateCollectionAnalytics(collection.id);
      }

      collection = await this.pricingCollectionRepository.findByOwnerAndName(owner, newCollection.name);

      return collection;
    } catch (err) {
      await this._handleCollectionCreationError(err as Error, collection, newCollection, owner);
    }
  }

  async bulkCreate(file: any, newCollectionData: any, owner: string, reqUser: LeanUser) {
    if (owner !== reqUser.username && reqUser.role !== 'ADMIN') {
      throw new Error('PERMISSION ERROR: You can only create collections for yourself');
    }

    let collection: any;
    try {
      const extractPath = this._getExtractPath(owner, newCollectionData.name);
      const zipPath = file.path;

      const extractedFiles = await decompressZip(zipPath, extractPath);

      newCollectionData._ownerName = owner;

      // Create collection and keep reference so we only attempt cleanup if it was created
      collection = await this.pricingCollectionRepository.create(newCollectionData);

      const pricingDatas = [];
      const pricingsWithErrors = [];
      for (const pricing of extractedFiles) {
        if (!(pricing.endsWith('.yaml') || pricing.endsWith('.yml'))) {
          continue;
        }
        try {
          const uploadedPricing = retrievePricingFromPath(pricing);
          const pricingAnalytics = new PricingAnalytics(uploadedPricing);

          const normalizedPath = pricing.replace(/\\/g, '/');
          const staticIndex = normalizedPath.indexOf('static/');

          if (staticIndex === -1) {
            throw new Error('INVALID DATA: Invalid pricing path - it must contain "static/".');
          }

          const yamlPath = normalizedPath.slice(staticIndex);

          const pricingData = {
            name:
              uploadedPricing.saasName.split(' ')[0].charAt(0).toUpperCase() +
              uploadedPricing.saasName.split(' ')[0].slice(1).toLowerCase(),
            version: uploadedPricing.version,
            _collectionId: collection._id,
            owner: owner,
            currency: uploadedPricing.currency,
            createdAt: new Date(uploadedPricing.createdAt),
            url: '',
            yaml: yamlPath,
            analytics: await pricingAnalytics.getAnalytics(),
          };
          pricingDatas.push(pricingData);
        } catch (err) {
          pricingsWithErrors.push({
            name: `${pricing.split('/')[pricing.split('/').length - 2]}/${pricing.split('/')[pricing.split('/').length - 1]}`,
            error: err,
          });
        }
      }

      await this.pricingRepository.create(pricingDatas);

      await this.updateCollectionAnalytics(collection.id);

      return [collection, pricingsWithErrors];
    } catch (err) {
      throw await this._handleCollectionCreationError(
        err as Error,
        collection,
        newCollectionData,
        owner
      );
    }
  }

  async generateCollectionAnalytics(collectionName: string, owner: string) {
    try {
      const collectionPricings = await this.pricingCollectionRepository.findCollectionPricings(
        collectionName,
        owner
      );
      if (!collectionPricings) {
        throw new Error('NOT FOUND: Collection not found');
      }

      const analytics = calculateAnalyticsForPricings(collectionPricings.pricings);

      await this.pricingCollectionRepository.setCollectionAnalytics(
        collectionPricings._id,
        analytics
      );
      return true;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  async update(collectionName: string, owner: string, data: any) {
    const collection = await this.pricingCollectionRepository.findByOwnerAndName(
      owner,
      collectionName
    );
    if (!collection) {
      throw new Error('NOT FOUND: Either the collection does not exist or you are not its owner');
    }

    await this.pricingCollectionRepository.update(collection._id.toString(), data);

    const updatedCollection = await this.pricingCollectionRepository.findById(
      collection._id.toString()
    );

    if (!updatedCollection) {
      throw new Error('NOT FOUND: Collection not found after update');
    }

    if (updatedCollection.name !== collectionName) {
      fs.renameSync(
        this._getExtractPath(owner, collectionName),
        this._getExtractPath(owner, updatedCollection.name)
      );
    }

    return updatedCollection;
  }

  async updateCollectionAnalytics(collectionId: string) {
    const collection = await this.pricingCollectionRepository.findById(collectionId);

    if (!collection) {
      throw new Error('NOT FOUND: Pricing collection not found');
    }

    const newAnalyticsEntry = this._computeCollectionAnalytics(collection);

    await this.pricingCollectionRepository.updateAnalytics(collection.id, newAnalyticsEntry);
  }

  async destroy(
    collectionName: string,
    owner: string,
    deleteCascade: boolean,
    ignoreResult: boolean = false
  ) {
    const collection = await this.pricingCollectionRepository.findByOwnerAndName(
      owner,
      collectionName
    );
    if (!collection) {
      throw new Error('NOT FOUND: Either the collection does not exist or you are not its owner');
    }

    let result;

    if (deleteCascade) {
      result = await this.pricingCollectionRepository.destroyWithPricings(
        collection._id.toString()
      );

      fs.rmdirSync(this._getExtractPath(owner, collectionName), { recursive: true });
    } else {
      await this.pricingRepository.removePricingsFromCollection(collection._id.toString());
      result = await this.pricingCollectionRepository.destroy(collection._id.toString());
    }

    if (!result && !ignoreResult) {
      throw new Error('NOT FOUND: Collection not found');
    }

    return true;
  }

  _computeCollectionAnalytics(collection: RetrievedCollection) {
    const collectionPricings = collection.pricings?.[0]?.pricings ?? [];
    const numberOfPricings = collectionPricings.length;
    if (collectionPricings.length === 0) {
      return {
        evolutionOfPlans: { date: new Date().toISOString(), value: 0 },
        evolutionOfAddOns: { date: new Date().toISOString(), value: 0 },
        evolutionOfConfigurationSpaceSize: { date: new Date().toISOString(), value: 0 },
        evolutionOfFeatures: { date: new Date().toISOString(), value: 0 },
      };
    }

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

  async _handleCollectionCreationError(
    err: Error,
    collection: any,
    newCollectionData: any,
    owner: string
  ): Promise<Error> {
    // If a collection was created before the error, remove it (cleanup of partial state)
    try {
      if (collection?._id) {
        await this.destroy(newCollectionData.name, owner, true, true);
      }
    } catch (cleanupErr) {
      // If cleanup fails, log it but continue to throw the original error

      console.error('Error during cleanup after bulkCreate failure:', cleanupErr);
    }

    const errMsg = (err as any)?.message || String(err);

    // Detect duplicate key / already exists errors and surface a clear message
    if (
      errMsg.includes('E11000') ||
      errMsg.toLowerCase().includes('duplicate') ||
      errMsg.toLowerCase().includes('already exists')
    ) {
      throw new Error('A collection with this name already exists. Please choose another name.');
    }

    throw new Error(errMsg);
  }

  _normalizeCollectionAnalytics(analytics: any) {
    const ensureSeries = (series: any) => ({
      dates: Array.isArray(series?.dates) ? series.dates : [],
      values: Array.isArray(series?.values) ? series.values : [],
    });

    return {
      evolutionOfPlans: ensureSeries(analytics?.evolutionOfPlans),
      evolutionOfAddOns: ensureSeries(analytics?.evolutionOfAddOns),
      evolutionOfFeatures: ensureSeries(analytics?.evolutionOfFeatures),
      evolutionOfConfigurationSpaceSize: ensureSeries(analytics?.evolutionOfConfigurationSpaceSize),
    };
  }
}

export default PricingCollectionService;
