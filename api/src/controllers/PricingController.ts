import fs from 'fs';
import container from '../config/container.js';
import PricingService from '../services/PricingService';
import path from 'path';
import { PricingIndexQueryParams } from '../types/services/PricingService.js';

class PricingController {
  private pricingService: PricingService;

  constructor() {
    this.pricingService = container.resolve('pricingService');
    this.index = this.index.bind(this);
    this.indexByUserWithoutCollection = this.indexByUserWithoutCollection.bind(this);
    this.show = this.show.bind(this);
    this.create = this.create.bind(this);
    this.addPricingToCollection = this.addPricingToCollection.bind(this);
    this.update = this.update.bind(this);
    this.removePricingFromCollection = this.removePricingFromCollection.bind(this);
    this.destroyByNameAndOwner = this.destroyByNameAndOwner.bind(this);
    this.destroyVersionByNameAndOwner = this.destroyVersionByNameAndOwner.bind(this);
  }

  async index(req: any, res: any) {
    try {
      const queryParams: PricingIndexQueryParams = this._transformIndexQueryParams(req.query);

      const pricings = await this.pricingService.index(queryParams);
      res.json(pricings);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  async indexByUserWithoutCollection(req: any, res: any) {
    try {
      const pricings = await this.pricingService.indexByUserWithoutCollection(req.user.username);
      res.json({ pricings });
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }

  async show(req: any, res: any) {
    try {
      const queryParams = req.query;
      const pricing = await this.pricingService.show(req.params.pricingName, req.params.owner, queryParams);
      res.json(pricing);
    } catch (err: any) {
      if (err.message.toLowerCase().includes('not found')) {
        res.status(404).send({ error: err.message });
      } else {
        res.status(500).send({ error: err.message });
      }
    }
  }

  async create(req: any, res: any) {
    try {
      const pricing = await this.pricingService.create(req.file, req.user.username);
      res.json(pricing);
    } catch (err: any) {
      try {
        const file = req.file;
        const directory = path.dirname(file.path);
        if (fs.readdirSync(directory).length === 1) {
          fs.rmdirSync(directory, { recursive: true });
        } else {
          fs.rmSync(file.path);
        }
        res.status(500).send({ error: err.message });
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
      res.json(result);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  async update(req: any, res: any) {
    try {
      const pricing = await this.pricingService.update(
        req.params.pricingName,
        req.user.username,
        req.body
      );
      res.json(pricing);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  async removePricingFromCollection(req: any, res: any) {
    try {
      const result = await this.pricingService.removePricingFromCollection(
        req.params.pricingName,
        req.user.username
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  async destroyByNameAndOwner(req: any, res: any) {
    try {
      const result = await this.pricingService.destroy(req.params.pricingName, req.user.username);
      if (!result) {
        res.status(404).send({ error: 'Pricing not found' });
      } else {
        res.status(200).send({message: "Pricing deleted successfully" });
      }
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  async destroyVersionByNameAndOwner(req: any, res: any) {
    try{
      const result = await this.pricingService.destroyVersion(req.params.pricingName, req.params.pricingVersion, req.user.username);
      if (!result) {
        res.status(404).send({ error: 'Pricing version not found' });
      } else {
        res.status(200).send({message: "Pricing version deleted successfully" });
      }
    }catch(err: any){
      res.status(500).send({ error: err.message });
    }
  }

  _transformIndexQueryParams(
    indexQueryParams: Record<string, string | number>
  ): PricingIndexQueryParams {
    const transformedData: PricingIndexQueryParams = {
      name: indexQueryParams.name as string,
      sortBy: indexQueryParams.sortBy as string,
      sort: indexQueryParams.sort as string,
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
