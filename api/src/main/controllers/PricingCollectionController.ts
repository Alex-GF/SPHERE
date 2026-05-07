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
    this.indexByOrganizationId = this.indexByOrganizationId.bind(this);
    this.downloadCollection = this.downloadCollection.bind(this);
    this.create = this.create.bind(this);
    this.bulkCreate = this.bulkCreate.bind(this);
    // this.generateAnalytics = this.generateAnalytics.bind(this);
    this.update = this.update.bind(this);
    this.destroy = this.destroy.bind(this);
    this.removePricingFromCollection = this.removePricingFromCollection.bind(this);
    this.createInOrganization = this.createInOrganization.bind(this);
    this.updateInOrganization = this.updateInOrganization.bind(this);
    this.destroyInOrganization = this.destroyInOrganization.bind(this);
    this.removePricingFromCollectionInOrganization = this.removePricingFromCollectionInOrganization.bind(this);
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
        req.params.organizationId,
        req.params.collectionName,
        req.user
      );
      res.json(collection);
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async indexByOrganizationId(req: any, res: any) {
    try {
      const collections = await this.pricingCollectionService.index({ organizationIds: [req.params.organizationId]}, req.user);
      res.json(collections);
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async downloadCollection(req: any, res: any) {
    try {
      const collectionName = req.params.collectionName;
      const organizationId = req.params.organizationId;
      const collection = await this.pricingCollectionService.show(
        organizationId,
        collectionName,
        req.user
      );
      const pricings = await this.pricingService.indexByCollection(collection.id);
      const pricingsToDownload = pricings.map(pricing => pricing.yaml);

      if (pricingsToDownload.length === 0) {
        res.status(400).send({ error: 'No pricings to download.' });
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
        const pathParts = pricingPath.split('/');
        const pricingName = pathParts[3];
        const pricingFileName = pathParts[pathParts.length - 1];

        archive.file(relativePath, {
          name: path.posix.join(pricingName, pricingFileName),
        });
      });

      archive.on('error', (err: any) => {
        throw new Error(err);
      });
      archive.finalize();

    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async create(req: any, res: any) {
    try {
      const pricing = await this.pricingCollectionService.create(
        req.body,
        req.params.organizationId,
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
        req.params.organizationId,
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
        req.params.organizationId,
        req.params.collectionName,
        req.body,
        req.user
      );
      await this.pricingService.updatePricingsCollectionName(
        req.params.collectionName,
        collection.name,
        collection.id
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
        req.params.organizationId,
        req.params.collectionName,
        deleteCascade,
        false,
        req.user
      );
      const message = result ? 'Successfully deleted.' : 'Could not delete collection.';
      res.status(204).json({ message: message });
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async removePricingFromCollection(req: any, res: any) {
    try {
      await this.pricingCollectionService.removePricingFromCollection(
        req.params.pricingName,
        req.params.organizationId,
        req.params.collectionName,
        req.user
      );
      res.json({message: 'Pricing removed from collection successfully.'});
    } catch (err: any) {
      const {status, message} = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async createInOrganization(req: any, res: any) {
    try {
      const payload = { ...req.body, _organizationId: req.params.organizationId };
      const collection = await this.pricingCollectionService.create(payload, req.params.organizationId, req.user);
      res.status(201).json(collection);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async updateInOrganization(req: any, res: any) {
    try {
      const collection = await this.pricingCollectionService.update(
        req.params.organizationId,
        req.params.collectionName,
        req.body,
        req.user
      );
      res.json(collection);
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async destroyInOrganization(req: any, res: any) {
    try {
      const { cascade } = req.query;
      const deleteCascade = String(cascade).toLowerCase() === 'true';
      await this.pricingCollectionService.destroy(
        req.params.organizationId,
        req.params.collectionName,
        deleteCascade,
        false,
        req.user
      );
      res.status(204).json({ message: 'Successfully deleted.' });
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  async removePricingFromCollectionInOrganization(req: any, res: any) {
    try {
      await this.pricingCollectionService.removePricingFromCollection(
        req.params.pricingName,
        req.params.organizationId,
        req.params.collectionName,
        req.user
      );
      res.json({ message: 'Pricing removed from collection successfully.' });
    } catch (err: any) {
      const { status, message } = handleError(err);
      res.status(status).send({ error: message });
    }
  }

  _transformIndexQueryParams(indexQueryParams: Record<string, string>): CollectionIndexQueryParams {
    const transformedData: CollectionIndexQueryParams = {
      name: indexQueryParams.name,
      sortBy: indexQueryParams.sortBy,
      sort: indexQueryParams.sort ?? 'asc',
      organizationIds: indexQueryParams.organizationIds ? indexQueryParams.organizationIds.split(',') : undefined,
      limit: indexQueryParams.limit,
      offset: indexQueryParams.offset,
    };

    const optionalFields = ['name', 'sortBy', 'sort', 'organizationIds', 'limit', 'offset'];

    optionalFields.forEach(field => {
      if (!transformedData[field]) {
        delete transformedData[field];
      }
    });

    return transformedData;
  }
}

export default PricingCollectionController;
