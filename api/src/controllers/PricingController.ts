import fs from 'fs';
import container from '../config/container.js'
import PricingService from '../services/PricingService';
import path from 'path';
import { PricingIndexQueryParams } from '../types/services/PricingService.js';

class PricingController {

  private pricingService: PricingService;

  constructor () {
    this.pricingService = container.resolve('pricingService');
    this.index = this.index.bind(this);
    this.indexByUser = this.indexByUser.bind(this);
    this.show = this.show.bind(this);
    this.create = this.create.bind(this);
  }

  async index (req: any, res: any) {
    try {
      const queryParams: PricingIndexQueryParams = this._transformIndexQueryParams(req.query);
      
      const pricings = await this.pricingService.index(queryParams)
      res.json(pricings)
    } catch (err: any) {
      res.status(500).send({error: err.message})
    }
  }

  async indexByUser (req: any, res: any) {
    try {
      const pricings = await this.pricingService.indexByUser(req.user.username)
      res.json({pricings})
    } catch (err: any) {
      res.status(500).send(err.message)
    }
  }

  async show (req: any, res: any) {
    try {
      const pricing = await this.pricingService.show(req.params.pricingName, req.params.owner)
      res.json(pricing)
    } catch (err: any) {
      if (err.message.toLowerCase().includes('not found')) {
        res.status(404).send({error: err.message})
      }else{
        res.status(500).send({error: err.message})
      }
    }
  }

  async create (req: any, res: any) {
    try {
      const pricing = await this.pricingService.create(req.file, req.user.username)
      res.json(pricing)
    } catch (err: any) {
      try{
        const file = req.file;
        const directory = path.dirname(file.path);
        if (fs.readdirSync(directory).length === 1) {
          fs.rmdirSync(directory, { recursive: true });
        }else{
          fs.rmSync(file.path);
        }
        res.status(500).send({error: err.message})
      }catch(err){
        res.status(500).send({error: (err as Error).message})
      }
    }
  }

  // async destroy (req: any, res: any) {
  //   try {
  //     const result = await this.pricingService.destroy(req.params.pricingId)
  //     const message = result ? 'Successfully deleted.' : 'Could not delete pricing.'
  //     res.json(message)
  //   } catch (err: any) {
  //     res.status(500).send(err.message)
  //   }
  // }

  _transformIndexQueryParams(indexQueryParams: Record<string, string | number>): PricingIndexQueryParams{
    const transformedData: PricingIndexQueryParams = {
      name: indexQueryParams.name as string,
      sortBy: indexQueryParams.sortBy as string,
      sort: indexQueryParams.sort as string,
      subscriptions: {
        min: parseFloat(indexQueryParams["min-subscription"] as string),
        max: parseFloat(indexQueryParams["max-subscription"] as string)
      },
      minPrice: {
        min: parseFloat(indexQueryParams["min-minPrice"] as string),
        max: parseFloat(indexQueryParams["max-minPrice"] as string)
      },
      maxPrice: {
        min: parseFloat(indexQueryParams["min-maxPrice"] as string),
        max: parseFloat(indexQueryParams["max-maxPrice"] as string)
      },
      selectedOwners: indexQueryParams.selectedOwners ? (indexQueryParams.selectedOwners as string).split(",") : undefined
    }

    const optionalFields = ['name', 'subscriptions', 'minPrice', 'maxPrice', 'selectedOwners', 'sortBy', 'sort'] as const;

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

  _containsNaN(attr: any): boolean{
    return Object.values(attr).every((value) => Number.isNaN(value));
  }
}

export default PricingController
