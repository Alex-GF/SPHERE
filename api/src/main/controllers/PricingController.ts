import fs from 'fs';
import container from '../config/container';
import PricingService from '../services/PricingService';
import path from 'path';
import { PricingIndexQueryParams, SortByType } from '../types/services/PricingService.js';
import { handleError } from '../utils/users/helpers';

class PricingController {
  private pricingService: PricingService;

  constructor() {
    this.pricingService = container.resolve('pricingService');
    this.index = this.index.bind(this);
    this.indexByOwner = this.indexByOwner.bind(this);
    this.show = this.show.bind(this);
    this.getConfigurationSpace = this.getConfigurationSpace.bind(this);
    this.create = this.create.bind(this);
    this.addPricingToCollection = this.addPricingToCollection.bind(this);
    this.update = this.update.bind(this);
    this.updateVersion = this.updateVersion.bind(this);
    // this.removePricingFromCollection = this.removePricingFromCollection.bind(this);
    this.destroyByNameAndOwner = this.destroyByNameAndOwner.bind(this);
    this.destroyVersionByNameAndOwner = this.destroyVersionByNameAndOwner.bind(this);
  }

  async index(req: any, res: any) {
    try {
      const queryParams: PricingIndexQueryParams = this._transformIndexQueryParams(req.query);

      const pricings = await this.pricingService.index(queryParams, req.user);
      res.json(pricings);
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async indexByOwner(req: any, res: any) {
    try {
      const queryParams: PricingIndexQueryParams = this._transformIndexQueryParams(req.query);
      queryParams.selectedOwners = [req.params.username]; // Set selectedOwners filter for indexByOwner route

      if (
        (req.user.username !== req.params.username && req.user.role === 'ADMIN') ||
        req.user.username === req.params.username
      ) {
        queryParams.includePrivate = true;
      }

      const pricings = await this.pricingService.index(queryParams, req.user);
      res.json(pricings);
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async show(req: any, res: any) {
    try {
      const queryParams = req.query;
      const pricing = await this.pricingService.show(
        req.params.pricingName,
        req.params.username,
        req.user,
        queryParams
      );
      res.json(pricing);
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async getConfigurationSpace(req: any, res: any) {
    try {
      const [configurationSpace, configurationSpaceSize] =
        await this.pricingService.getConfigurationSpace(req.params.username, req.params.pricingName, req.params.pricingVersion, req.query);
      res.json({
        configurationSpace: configurationSpace,
        configurationSpaceSize: configurationSpaceSize,
      });
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async create(req: any, res: any) {
    try {
      const isPrivate = req.body.private === 'true' || req.body.private === true;
      const collectionId = req.body.collectionId;
      const pricing = await this.pricingService.create(
        req.file,
        req.params.username,
        isPrivate,
        req.user,
        collectionId
      );
      res.json(pricing[0]);
    } catch (err: any) {
      try {
        const file = req.file;
        const directory = path.dirname(file.path);
        if (fs.readdirSync(directory).length === 1) {
          fs.rmSync(directory, { recursive: true });
        } else {
          fs.rmSync(file.path);
        }
        const { status, message } = handleError(err);
        res.status(status).send({ error: message });
      } catch (err) {
        res.status(500).send({ error: (err as Error).message });
      }
    }
  }

  async addPricingToCollection(req: any, res: any) {
    try {
      const result = await this.pricingService.addPricingToCollection(
        req.body.pricingName,
        req.user.username,
        req.body.collectionId
      );

      if (!result) {
        res.status(404).send({ error: 'ERROR: Pricing not found or you are not the owner' });
      }
      
      res.json({ message: "Pricing added to collection successfully" });
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async update(req: any, res: any) {
    try {
      const pricing = await this.pricingService.update(
        req.params.pricingName,
        req.params.username,
        req.user,
        req.body
      );
      res.json(pricing);
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async updateVersion(req: any, res: any) {
    try {
      const pricing = await this.pricingService.updateVersion(req.body.pricing);
      res.json(pricing);
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  // async removePricingFromCollection(req: any, res: any) {
  //   try {
  //     const result = await this.pricingService.removePricingFromCollection(
  //       req.params.pricingName,
  //       req.user.username
  //     );
  //     res.json(result);
  //   } catch (err: any) {
  //     const {status, message} = handleError(err);
  //     res.status(status).send({ error: message });
  //   }
  // }

  async destroyByNameAndOwner(req: any, res: any) {
    try {
      const queryParams = req.query;
      const result = await this.pricingService.destroy(
        req.params.pricingName,
        req.params.username,
        req.user,
        queryParams
      );
      if (!result) {
        res.status(404).send({ error: 'Pricing not found' });
      } else {
        res.status(200).send({ message: 'Pricing deleted successfully' });
      }
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async destroyVersionByNameAndOwner(req: any, res: any) {
    try {
      const result = await this.pricingService.destroyVersion(
        req.params.pricingName,
        req.params.pricingVersion,
        req.params.username,
        req.user
      );
      if (!result) {
        res.status(404).send({ error: 'Pricing version not found' });
      } else {
        res.status(200).send({ message: 'Pricing version deleted successfully' });
      }
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  _transformIndexQueryParams(
    indexQueryParams: Record<string, string>
  ): PricingIndexQueryParams {
    const transformedData: PricingIndexQueryParams = {
      name: indexQueryParams.name as string,
      sortBy: indexQueryParams.sortBy as SortByType,
      sort: indexQueryParams.sort === 'asc' ? 'asc' : 'desc',
      subscriptions: {
        min: parseFloat(indexQueryParams['min-subscription'] as string),
        max: parseFloat(indexQueryParams['max-subscription'] as string),
      },
      minPrice: {
        min: parseFloat(indexQueryParams['min-minPrice'] as string),
        max: parseFloat(indexQueryParams['max-minPrice'] as string),
      },
      maxPrice: {
        min: parseFloat(indexQueryParams['min-maxPrice'] as string),
        max: parseFloat(indexQueryParams['max-maxPrice'] as string),
      },
      selectedOwners: indexQueryParams.selectedOwners
        ? (indexQueryParams.selectedOwners as string).split(',')
        : undefined,
      limit: parseInt(indexQueryParams.limit) || 10,
      offset: parseInt(indexQueryParams.offset) || 0,
    };

    const optionalFields = [
      'name',
      'subscriptions',
      'minPrice',
      'maxPrice',
      'selectedOwners',
      'sortBy',
      'sort',
    ] as const;

    optionalFields.forEach(field => {
      if (['name', 'selectedOwners', 'sortBy', 'sort'].includes(field)) {
        if (!transformedData[field]) {
          delete transformedData[field];
        }
      } else {
        if (this._containsNaN(transformedData[field]!)) {
          delete transformedData[field];
        }
      }
    });

    return transformedData;
  }

  _containsNaN(attr: any): boolean {
    return Object.values(attr).every(value => Number.isNaN(value));
  }
}

export default PricingController;
