import { Pricing } from 'pricing4ts';
import { Pricing as PricingModel } from '../types/database/Pricing';
import container from '../config/container';
import { processFileUris } from './FileService';
import {
  PricingService as PricingAnalytics,
  retrievePricingFromPath,
  retrievePricingFromText,
} from 'pricing4ts/server';
import { PricingIndexQueryParams } from '../types/services/PricingService';
import PricingCollectionService from './PricingCollectionService';
import PricingRepository from '../repositories/mongoose/PricingRepository';
import CacheService from './CacheService';
import { LeanUser } from '../types/models/User';
import OrganizationMembershipRepository from '../repositories/mongoose/OrganizationMembershipRepository';

class PricingService {
  private pricingRepository: PricingRepository;
  private pricingCollectionService: PricingCollectionService;
  private cacheService: CacheService;
  private organizationMembershipRepository: OrganizationMembershipRepository;

  constructor() {
    this.pricingRepository = container.resolve('pricingRepository');
    this.pricingCollectionService = container.resolve('pricingCollectionService');
    this.cacheService = container.resolve('cacheService');
    this.organizationMembershipRepository = container.resolve('organizationMembershipRepository');
  }

  async index(queryParams: PricingIndexQueryParams, reqUser?: LeanUser) {
    const includePrivate = reqUser !== undefined && reqUser.role === 'ADMIN';

    const pricings = await this.pricingRepository.findAll(queryParams, includePrivate);
    return pricings;
  }

  async indexByCollection(collectionId: string) {
    const pricings = await this.pricingRepository.findByCollection(collectionId);
    return pricings;
  }

  async show(
    name: string,
    organizationId: string,
    reqUser?: LeanUser,
    queryParams: { collectionName?: string; includePrivate: boolean } = { includePrivate: false }
  ) {
    if (reqUser) {
      const role = await this.organizationMembershipRepository.findUserRoleInOrganization(reqUser.id, organizationId);
      queryParams.includePrivate = reqUser.role === 'ADMIN' || role !== null;
    }

    const pricing: { name: string; versions: PricingModel[] } | null =
      await this.pricingRepository.findOne(name, organizationId, queryParams);

    if (!pricing) {
      throw new Error('NOT FOUND: Pricing not found');
    }

    for (const version of pricing.versions) {
      processFileUris(version, ['yaml']);
    }

    return pricing;
  }

  async getConfigurationSpace(
    organizationId: string,
    pricingName: string,
    pricingVersion: string,
    reqUser?: LeanUser,
    queryParams?: { collectionName?: string, limit?: string; offset?: string }
  ) {
    // Validations
    if (queryParams?.limit && !/^\d+$/.test(queryParams.limit)) {
      throw new Error('INVALID DATA: Invalid limit parameter, it must be a numeric value');
    }

    if (queryParams?.offset && !/^\d+$/.test(queryParams.offset)) {
      throw new Error('INVALID DATA: Invalid offset parameter, it must be a numeric value');
    }

    const formattedQueryParams = {
      limit: queryParams?.limit ? parseInt(queryParams.limit) : undefined,
      offset: queryParams?.offset ? parseInt(queryParams.offset) : undefined,
    };

    let includePrivate = false;
    if (reqUser) {
      const role = await this.organizationMembershipRepository.findUserRoleInOrganization(reqUser.id, organizationId);
      includePrivate = reqUser.role === 'ADMIN' || role !== null;
    }

    const retrievedPricing = await this.pricingRepository.findOne(
      pricingName,
      organizationId,
      { ...queryParams, version: pricingVersion, includePrivate }
    );
    if (!retrievedPricing) {
      throw new Error('NOT FOUND: Pricing not found');
    }

    if (!process.env.SERVER_STATICS_FOLDER) {
      throw new Error('SERVER_STATICS_FOLDER env not set');
    }

    let configurationSpace = null;
    const key: string = `${organizationId}.${pricingName}.${pricingVersion}.configurationSpace`;
    const cachedConfigurationSpace = await this.cacheService.get(key);

    if (cachedConfigurationSpace) {
      configurationSpace = cachedConfigurationSpace;
    } else {
      // Configuariton space calculation
      const pricingInfo: Pricing = retrievePricingFromPath(
        process.env.SERVER_STATICS_FOLDER + retrievedPricing.versions[0].yaml
      );
      const pricingAnalytics = new PricingAnalytics(pricingInfo);
      configurationSpace = await pricingAnalytics.getConfigurationSpace();
      await this.cacheService.set(key, configurationSpace, 60 * 60 * 24);
    }

    // Pagination
    const startPaginationIndex = formattedQueryParams.offset ? formattedQueryParams.offset : 0;
    const endPaginationIndex = formattedQueryParams.limit
      ? startPaginationIndex + formattedQueryParams.limit
      : configurationSpace.length;

    return [
      configurationSpace.slice(startPaginationIndex, endPaginationIndex),
      configurationSpace.length,
    ];
  }

  async create(
    pricingFile: any,
    organizationId: string,
    isPrivate: boolean,
    reqUser: LeanUser,
    collectionId?: string
  ) {
    try {
      const role = await this.organizationMembershipRepository.findUserRoleInOrganization(reqUser.id, organizationId);
      if (!role && reqUser.role !== 'ADMIN') {
        throw new Error(
          'PERMISSION ERROR: You do not have permission to create a pricing for this organization'
        );
      }

      const uploadedPricing: Pricing = retrievePricingFromPath(
        typeof pricingFile === 'string' ? pricingFile : pricingFile.path
      );

      const previousPricing = await this.pricingRepository.findOne(
        uploadedPricing.saasName,
        organizationId,
        { collectionId: collectionId, includePrivate: true }
      );

      if (!collectionId && previousPricing && previousPricing.versions[0]._collectionId) {
        collectionId = previousPricing.versions[0]._collectionId.toString();
      }

      const rawPath = typeof pricingFile === 'string' ? pricingFile : pricingFile.path;
      const normalizedPath = rawPath.replace(/\\/g, '/');
      const staticIndex = normalizedPath.indexOf('static/');

      if (staticIndex === -1) {
        throw new Error('Invalid pricing path: it must contain "static/".');
      }

      const yamlPath = normalizedPath.slice(staticIndex);

      const pricingData = {
        name: uploadedPricing.saasName,
        version: uploadedPricing.version,
        _collectionId: collectionId,
        _organizationId: organizationId,
        private: isPrivate,
        currency: uploadedPricing.currency,
        createdAt: new Date(uploadedPricing.createdAt),
        url: '',
        yaml: yamlPath,
        analytics: {},
      };

      const pricing = await this.pricingRepository.create([pricingData]);

      processFileUris(pricing[0], ['yaml']);

      const pricingAnalytics = new PricingAnalytics(uploadedPricing);

      await pricingAnalytics
        .getAnalytics()
        .then((analytics: any) => {
          this.pricingRepository.updateAnalytics(pricing[0]._id.toString(), analytics);
        })
        .catch(async (err: any) => {
          await this.pricingRepository.destroy(pricing[0]._id.toString());
          throw new Error((err as Error).message);
        });

      if (collectionId) {
        await this.pricingCollectionService.updateCollectionAnalytics(collectionId);
      }

      return pricing;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  async addPricingToCollection(pricingName: string, organizationId: string, collectionId: string, queryParams: { collectionName?: string } = {}) {
    try {
      const pricing = await this.pricingRepository.findOne(pricingName, organizationId, { ...queryParams, includePrivate: true });
      if (!pricing) {
        throw new Error('NOT FOUND: Pricing not found. Please check that: 1) the pricing is created, 2) that you\'re a member of the organization, and 3) that the collectionName you\'ve specified is correct (the collectionName is case-sensitive).');
      }

      await this.pricingRepository.addPricingToCollection(pricingName, organizationId, collectionId);
      await this.pricingCollectionService.updateCollectionAnalytics(collectionId);

      return true;
    } catch (err) {
      throw new Error((err as Error).message);
    }
  }

  async update(pricingName: string, organizationId: string, reqUser: LeanUser, data: any, queryParams: { collectionName?: string; organizationId?: string } = {}) {
    const effectiveOrgId = queryParams.organizationId || organizationId;
    const role = await this.organizationMembershipRepository.findUserRoleInOrganization(reqUser.id, effectiveOrgId);
    if (!role && reqUser.role !== 'ADMIN') {
      throw new Error(
        'PERMISSION ERROR: You do not have permission to update a pricing for this organization'
      );
    }

    const pricing = await this.pricingRepository.findOne(pricingName, effectiveOrgId, { ...queryParams, includePrivate: true });
    if (!pricing) {
      throw new Error('NOT FOUND: Either the pricing does not exist or you are not a member of its organization');
    }

    for (const pricingVersion of pricing.versions) {
      await this.pricingRepository.update(pricingVersion.id, data);
    }

    const updatedPricing = await this.pricingRepository.findOne(pricingName, effectiveOrgId, { ...queryParams, includePrivate: true });

    return updatedPricing;
  }

  async updateVersion(pricingString: string) {
    try {
      const updatedPricing: Pricing = retrievePricingFromText(pricingString);
      return updatedPricing;
    } catch (err) {
      throw new Error('INVALID DATA: Error updating pricing: ' + (err as Error).message);
    }
  }

  async updatePricingsCollectionName(
    oldCollectionName: string,
    newCollectionName: string,
    collectionId: string
  ) {
    if (oldCollectionName === newCollectionName) {
      return true;
    }

    const pricings = await this.pricingRepository.findByCollection(collectionId);
    const pricingsToUpdate = [];
    for (const pricing of pricings) {
      if (pricing.yaml.includes(oldCollectionName)) {
        pricing.yaml = pricing.yaml.replace(oldCollectionName, newCollectionName);
        pricingsToUpdate.push(pricing);
      }
    }

    await this.pricingRepository.updatePricingsCollectionName(pricingsToUpdate);
    return true;
  }

  async destroy(
    pricingName: string,
    organizationId: string,
    reqUser: LeanUser,
    queryParams: { collectionName?: string; organizationId?: string } = {}
  ) {
    const effectiveOrgId = queryParams.organizationId || organizationId;
    let collectionId;

    const role = await this.organizationMembershipRepository.findUserRoleInOrganization(reqUser.id, effectiveOrgId);
    if (!role && reqUser.role !== 'ADMIN') {
      throw new Error(
        'PERMISSION ERROR: You do not have permission to delete a pricing for this organization'
      );
    }

    if (queryParams?.collectionName) {
      const collection = await this.pricingCollectionService.show(
        effectiveOrgId,
        queryParams.collectionName,
        reqUser
      );
      if (!collection) {
        throw new Error('NOT FOUND: Collection not found');
      }

      collectionId = collection.id;
    }

    const result = await this.pricingRepository.destroyByNameOrganizationAndCollectionId(
      pricingName,
      effectiveOrgId,
      collectionId
    );
    if (!result) {
      throw new Error('NOT FOUND: Either the pricing does not exist or you are not a member of its organization');
    }
    return true;
  }

  async destroyVersion(
    pricingName: string,
    pricingVersion: string,
    organizationId: string,
    reqUser: LeanUser
  ) {
    const role = await this.organizationMembershipRepository.findUserRoleInOrganization(reqUser.id, organizationId);
    if (!role && reqUser.role !== 'ADMIN') {
      throw new Error(
        'PERMISSION ERROR: You do not have permission to delete a pricing version for this organization'
      );
    }

    let result;

    result = await this.pricingRepository.destroyVersionByNameAndOrganization(
      pricingName,
      pricingVersion,
      organizationId
    );

    if (!result) {
      result = await this.pricingRepository.destroyVersionByNameAndOrganization(
        pricingName,
        pricingVersion.replace('_', '.'),
        organizationId
      );
    }

    if (!result) {
      throw new Error('NOT FOUND: Either the pricing does not exist or you are not a member of its organization');
    }

    return true;
  }
}

export default PricingService;
