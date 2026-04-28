import container from '../config/container';
import PricingCollectionService from '../services/PricingCollectionService.js';
import PricingService from '../services/PricingService.js';
import { CollectionIndexQueryParams } from '../types/services/PricingCollection.js';
import path from 'path';
import archiver from 'archiver';
import { handleError } from '../utils/users/helpers';

class PricingCollectionController {
  private readonly pricingCollectionService: PricingCollectionService;
  private readonly pricingService: PricingService;

  constructor() {
    this.pricingCollectionService = container.resolve('pricingCollectionService');
    this.pricingService = container.resolve('pricingService');
    this.index = this.index.bind(this);
    this.show = this.show.bind(this);
    this.indexByUsername = this.indexByUsername.bind(this);
    this.downloadCollection = this.downloadCollection.bind(this);
    this.create = this.create.bind(this);
    this.bulkCreate = this.bulkCreate.bind(this);
    // this.generateAnalytics = this.generateAnalytics.bind(this);
    this.update = this.update.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  async index(req: any, res: any) {
    try {
      const queryParams: CollectionIndexQueryParams = this._transformIndexQueryParams(req.query);

      const result = await this.pricingCollectionService.index(queryParams);
      // result contains { collections, total }
      res.json(result);
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async show(req: any, res: any) {
    try {
      const collection = await this.pricingCollectionService.show(
        req.params.username,
        req.params.collectionName,
        req.user
      );
      res.json(collection);
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async indexByUsername(req: any, res: any) {
    try {
      const collections = await this.pricingCollectionService.indexByUsername(req.params.username, req.user);
      res.json({ collections: collections });
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async downloadCollection(req: any, res: any) {
    try {
      const collectionName = req.params.collectionName;
      const username = req.params.username;
      const collection = await this.pricingCollectionService.show(
        username,
        collectionName,
        req.user
      );
      const pricings = await this.pricingService.indexByCollection(collection._id.toString());
      const pricingsToDownload = pricings.map(pricing => pricing.yaml);

      if (pricingsToDownload.length === 0) {
        res.status(404).send({ error: 'No pricings to download.' });
        return;
      }

      const zipFileName = `${collectionName}.zip`;
      res.setHeader('Content-Disposition', `attachment; filename=${zipFileName}`);
      res.setHeader('Content-Type', 'application/zip');

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', err => {
        console.error('❌ ERROR with archiver:', err);
        res.status(500).send({ error: 'Error generating the ZIP.' });
      });

      // Event that confirms when the zip has been generated and closes the connection
      archive.on('end', () => {
        res.end();
      });

      archive.pipe(res);

      if (!process.env.COLLECTIONS_FOLDER) {
        throw new Error('Collections folder not defined in the environment.');
      }

      const baseDir = 'public';

      pricingsToDownload.forEach(pricingPath => {
        const relativePath = path.join(baseDir, pricingPath);
        archive.file(relativePath, { name: pricingPath.split('/').slice(4).join('/') });
      });

      archive.on('error', (err: any) => {
        throw new Error(err);
      });
      archive.finalize();

    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  async create(req: any, res: any) {
    try {
      const pricing = await this.pricingCollectionService.create(
        req.body,
        req.params.username,
        req.user
      );
      res.status(201).json(pricing);
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async bulkCreate(req: any, res: any) {
    try {
      const [collection, pricingsWithErrors] = await this.pricingCollectionService.bulkCreate(
        req.file,
        req.body,
        req.params.username,
        req.user
      );
      res.status(201).json({collection, pricingsWithErrors});
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  // async generateAnalytics(req: any, res: any) {
  //   if (req.user.username === req.params.username || req.user.role === 'ADMIN') {
  //     try {
  //       await this.pricingCollectionService.generateCollectionAnalytics(
  //         req.params.collectionName,
  //         req.params.username
  //       );
  //       res.status(200).send({ message: 'Analytics generated successfully.' });
  //     } catch (err: any) {
  //       const {status, message} = handleError(err);
  //       res.status(status).send({ error: message});
  //     }
  //   }else{
  //     res.status(403).send({ error: 'PERMISSION ERROR: This collection is not yours.' });
  //   }
  // }

  async update(req: any, res: any) {
    try {
      const collection = await this.pricingCollectionService.update(
        req.params.collectionName,
        req.user.id,
        req.body
      );
      await this.pricingService.updatePricingsCollectionName(
        req.params.collectionName,
        collection.name,
        collection.id.toString(),
        req.user.id
      );
      res.json(collection);
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async destroy(req: any, res: any) {
    try {
      const { cascade } = req.query;
      const deleteCascade = String(cascade).toLowerCase() === 'true';

      const result = await this.pricingCollectionService.destroy(
        req.params.collectionName,
        req.user.id,
        deleteCascade
      );
      const message = result ? 'Successfully deleted.' : 'Could not delete collection.';
      res.json({ message: message });
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  _transformIndexQueryParams(indexQueryParams: Record<string, string>): CollectionIndexQueryParams {
    const transformedData: CollectionIndexQueryParams = {
      name: indexQueryParams.name,
      sortBy: indexQueryParams.sortBy,
      sort: indexQueryParams.sort ?? 'asc',
      selectedOwners: indexQueryParams.owners ? indexQueryParams.owners.split(',') : undefined,
      limit: indexQueryParams.limit,
      offset: indexQueryParams.offset,
    };

    const optionalFields = ['name', 'sortBy', 'sort', 'selectedOwners', 'limit', 'offset'];

    optionalFields.forEach(field => {
      if (!transformedData[field]) {
        delete transformedData[field];
      }
    });

    return transformedData;
  }
}

export default PricingCollectionController;
