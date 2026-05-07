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
import OrganizationMembershipRepository from '../repositories/mongoose/OrganizationMembershipRepository';

class PricingCollectionService {
  private readonly pricingCollectionRepository: PricingCollectionRepository;
  private readonly pricingRepository: PricingRepository;
  private readonly organizationMembershipRepository: OrganizationMembershipRepository;

  constructor() {
    this.pricingCollectionRepository = container.resolve('pricingCollectionRepository');
    this.pricingRepository = container.resolve('pricingRepository');
    this.organizationMembershipRepository = container.resolve('organizationMembershipRepository');
  }

  async index(queryParams: CollectionIndexQueryParams, reqUser?: LeanUser) {

    const includePrivate = reqUser !== undefined && reqUser.role === 'ADMIN';

    const result = await this.pricingCollectionRepository.findAll(queryParams, includePrivate);
    // result contains { collections, total }
    return result;
  }

  async indexByOrganizationId(organizationId: string, reqUser?: LeanUser) {
    let includePrivate = false;
    if (reqUser) {
      const role = await this.organizationMembershipRepository.findUserRoleInOrganization(reqUser.id, organizationId);
      includePrivate = reqUser.role === 'ADMIN' || role !== null;
    }

    const collections = await this.pricingCollectionRepository.findByOrganizationId(
      organizationId,
      includePrivate
    );

    return collections;
  }

  async show(organizationId: string, collectionName: string, reqUser?: LeanUser) {
    const collection = await this.pricingCollectionRepository.findByOrganizationAndName(
      organizationId,
      collectionName
    );
    if (!collection) {
      throw new Error('NOT FOUND: Pricing collection not found');
    }

    if (collection.private) {
      if (!reqUser) {
        throw new Error('PERMISSION ERROR: You are not a member of this organization');
      }
      const role = await this.organizationMembershipRepository.findUserRoleInOrganization(reqUser.id, organizationId);
      if (!role && reqUser.role !== 'ADMIN') {
        throw new Error('PERMISSION ERROR: You are not a member of this organization');
      }
    }

    collection.analytics = this._normalizeCollectionAnalytics(collection.analytics);

    return collection;
  }

  async create(newCollection: any, organizationId: string, reqUser: LeanUser) {
    const role = await this.organizationMembershipRepository.findUserRoleInOrganization(reqUser.id, organizationId);
    if (!role && reqUser.role !== 'ADMIN') {
      throw new Error('PERMISSION ERROR: You can only create collections for organizations you belong to');
    }

    let collection: any;
    try {
      newCollection._organizationId = organizationId;
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
          organizationId,
          newCollection.pricings
        );

        await this.updateCollectionAnalytics(collection.id);
      }

      collection = await this.pricingCollectionRepository.findByOrganizationAndName(
        organizationId,
        newCollection.name
      );

      return collection;
    } catch (err) {
      await this._handleCollectionCreationError(err as Error, collection, newCollection, organizationId);
    }
  }

  async bulkCreate(file: any, newCollectionData: any, organizationId: string, reqUser: LeanUser) {
    const role = await this.organizationMembershipRepository.findUserRoleInOrganization(reqUser.id, organizationId);
    if (!role && reqUser.role !== 'ADMIN') {
      throw new Error('PERMISSION ERROR: You can only create collections for organizations you belong to');
    }

    let collection: any;
    try {
      const extractPath = this._getExtractPath(organizationId, newCollectionData.name);
      const zipPath = file.path;

      const extractedFiles = await decompressZip(zipPath, extractPath);

      newCollectionData._organizationId = organizationId;

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
            _organizationId: organizationId,
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
        organizationId
      );
    }
  }

  async generateCollectionAnalytics(collectionName: string, organizationId: string) {
    try {
      const collectionPricings = await this.pricingCollectionRepository.findCollectionPricingsByOrganization(
        collectionName,
        organizationId
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

  async update(organizationId: string, collectionName: string, data: any, reqUser: LeanUser) {
    const role = await this.organizationMembershipRepository.findUserRoleInOrganization(reqUser.id, organizationId);
    if (!role && reqUser.role !== 'ADMIN') {
      throw new Error('PERMISSION ERROR: You can only update collections for organizations you belong to');
    }

    const collection = await this.pricingCollectionRepository.findByOrganizationAndName(
      organizationId,
      collectionName
    );
    if (!collection) {
      throw new Error('NOT FOUND: Either the collection does not exist or you are not a member of its organization');
    }

    if (data.name && data.name !== collectionName) {
      const existingCollection = await this.pricingCollectionRepository.findByOrganizationAndName(
        organizationId,
        data.name
      );

      if (existingCollection) {
        throw new Error('CONFLICT: You already have a collection with that name.');
      }
    }

    await this.pricingCollectionRepository.update(collection.id, data);

    const updatedCollection = await this.pricingCollectionRepository.findById(collection.id);

    if (!updatedCollection) {
      throw new Error('NOT FOUND: Collection not found after update');
    }

    if (updatedCollection.name !== collectionName) {
      try {
        const sourcePath = this._getExtractPath(organizationId, collectionName);

        if (fs.existsSync(sourcePath)) {
          const destPath = this._getExtractPath(organizationId, updatedCollection.name);

          fs.mkdirSync(destPath, { recursive: true });
          fs.renameSync(sourcePath, destPath);
        }
      } catch (err) {
        // Attempt to rollback collection name change if folder rename fails
        await this.pricingCollectionRepository.update(collection.id, { name: collectionName });
        throw new Error(
          'Error renaming collection folder. Collection name change has been rolled back. Please try again.'
        );
      }
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
    organizationId: string,
    collectionName: string,
    deleteCascade: boolean,
    ignoreResult: boolean = false,
    reqUser?: LeanUser
  ) {
    if (!reqUser && !ignoreResult) {
      throw new Error(
        'INTERNAL ERROR: You have not provided "reqUser". Either set "ignoreResult" to true or provide the user performing the action as "reqUser".'
      );
    }

    if (reqUser && !ignoreResult) {
      const role = await this.organizationMembershipRepository.findUserRoleInOrganization(reqUser.id, organizationId);
      if (!role && reqUser.role !== 'ADMIN') {
        throw new Error('PERMISSION ERROR: You can only delete collections for organizations you belong to');
      }
    }

    const collection = await this.pricingCollectionRepository.findByOrganizationAndName(
      organizationId,
      collectionName
    );
    if (!collection) {
      throw new Error('NOT FOUND: Either the collection does not exist or you are not a member of its organization');
    }

    let result;

    if (deleteCascade) {
      result = await this.pricingCollectionRepository.destroyWithPricings(collection.id);

      const collectionPath = this._getExtractPath(organizationId, collectionName);
      if (fs.existsSync(collectionPath)) {
        fs.rmSync(collectionPath, { recursive: true });
      }
    } else {
      await this.pricingRepository.removePricingsFromCollection(collection.id);
      result = await this.pricingCollectionRepository.destroy(collection.id);
    }

    if (!result && !ignoreResult) {
      throw new Error('NOT FOUND: Collection not found');
    }

    return true;
  }

  async removePricingFromCollection(pricingName: string, organizationId: string, collectionName: string, reqUser?: LeanUser) {
    try {

      if (reqUser) {
        const role = await this.organizationMembershipRepository.findUserRoleInOrganization(reqUser.id, organizationId);
        if (!role && reqUser.role !== 'ADMIN') {
          throw new Error('PERMISSION ERROR: You can only remove pricings from collections for organizations you belong to');
        }
      }

      const pricing = await this.pricingRepository.findOne(pricingName, organizationId, { collectionName });

      if (!pricing) {
        throw new Error('NOT FOUND: Either the pricing does not exist or you are not a member of its organization');
      }

      await this.pricingRepository.removePricingFromCollection(pricingName, organizationId);
      if (pricing.versions[0]._collectionId) {
        await this.updateCollectionAnalytics(
          pricing.versions[0]._collectionId
        );
      } else {
        throw new Error('NOT FOUND: Pricing is not in a collection');
      }

      return true;
    } catch (err) {
      throw new Error((err as Error).message);
    }
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

  _getExtractPath(organizationId: string, collectionName: string) {
    return `${process.env.COLLECTIONS_FOLDER}/${organizationId}/${collectionName}`;
  }

  async _handleCollectionCreationError(
    err: Error,
    collection: any,
    newCollectionData: any,
    organizationId: string
  ): Promise<Error> {
    // If a collection was created before the error, remove it (cleanup of partial state)
    try {
      if (collection?._id) {
        await this.destroy(organizationId, newCollectionData.name, true, true);
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
