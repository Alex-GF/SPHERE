import container from '../config/container.js'
import PricingCollectionService from '../services/PricingCollectionService.js';
import { CollectionIndexQueryParams } from '../types/services/PricingCollection.js';

class PricingCollectionController {

  private pricingCollectionService: PricingCollectionService;

  constructor () {
    this.pricingCollectionService = container.resolve('pricingCollectionService');
    this.index = this.index.bind(this);
    this.showByNameAndUserId = this.showByNameAndUserId.bind(this);
    this.showByUserId = this.showByUserId.bind(this);
    // this.show = this.show.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
  }

  async index (req: any, res: any) {
    try {

      const queryParams: CollectionIndexQueryParams = this._transformIndexQueryParams(req.query);

      const collections = await this.pricingCollectionService.index(queryParams)
      res.json({collections: collections})
    } catch (err: any) {
      res.status(500).send({error: err.message})
    }
  }

  async showByNameAndUserId (req: any, res: any) {
    try {
      const collection = await this.pricingCollectionService.showByNameAndUserId(req.params.collectionName, req.params.userId)
      res.json(collection)
    } catch (err: any) {
      if (err.message.toLowerCase().includes('not found')) {
        res.status(404).send({error: err.message})
      }else{
        res.status(500).send({error: err.message})
      }
    }
  }

  async showByUserId (req: any, res: any) {
    try {
      const collections = await this.pricingCollectionService.showByUserId(req.user.id)
      res.json({collections: collections})
    } catch (err: any) {
      res.status(500).send({error: err.message})
    }
  }

  async create (req: any, res: any) {
    try {
      const pricing = await this.pricingCollectionService.create(req.body, req.user.id, req.user.username)
      res.json(pricing)
    } catch (err: any) {
      res.status(500).send({error: (err as Error).message})
    }
  }

  async update(req: any, res: any) {
    try {
      const pricing = await this.pricingCollectionService.update(
        req.params.colelctionName,
        req.user.id,
        req.body
      );
      res.json(pricing);
    } catch (err: any) {
      res.status(500).send({ error: err.message });
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

  _transformIndexQueryParams (indexQueryParams: Record<string, string>): CollectionIndexQueryParams {
    const transformedData: CollectionIndexQueryParams = {
      name: indexQueryParams.name,
      sortBy: indexQueryParams.sortBy,
      sort: indexQueryParams.sort ?? 'asc',
      selectedOwners: indexQueryParams.owners ? (indexQueryParams.owners).split(",") : undefined
    }

    const optionalFields = ['name', 'sortBy', 'sort', 'selectedOwners'];

    optionalFields.forEach(field => {
      
      if (!transformedData[field]) {
        delete transformedData[field];
      }
    });

    return transformedData;
  }
}

export default PricingCollectionController
