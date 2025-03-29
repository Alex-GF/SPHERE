import container from '../config/container.js';
import PricingCollectionService from '../services/PricingCollectionService.js';
import PricingService from '../services/PricingService.js';
import { CollectionIndexQueryParams } from '../types/services/PricingCollection.js';
import path from 'path';
import archiver from 'archiver';

class PricingCollectionController {
  private pricingCollectionService: PricingCollectionService;
  private pricingService: PricingService;

  constructor() {
    this.pricingCollectionService = container.resolve('pricingCollectionService');
    this.pricingService = container.resolve('pricingService');
    this.index = this.index.bind(this);
    this.showByNameAndUserId = this.showByNameAndUserId.bind(this);
    this.showByUserId = this.showByUserId.bind(this);
    // this.show = this.show.bind(this);
    this.downloadCollection = this.downloadCollection.bind(this);
    this.create = this.create.bind(this);
    this.bulkCreate = this.bulkCreate.bind(this);
    this.generateAnalytics = this.generateAnalytics.bind(this);
    this.update = this.update.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  async index(req: any, res: any) {
    try {
      const queryParams: CollectionIndexQueryParams = this._transformIndexQueryParams(req.query);

      const collections = await this.pricingCollectionService.index(queryParams);
      res.json({ collections: collections });
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  async showByNameAndUserId(req: any, res: any) {
    try {
      const collection = await this.pricingCollectionService.showByNameAndUserId(
        req.params.collectionName,
        req.params.userId
      );
      res.json(collection);
    } catch (err: any) {
      if (err.message.toLowerCase().includes('not found')) {
        res.status(404).send({ error: err.message });
      } else {
        res.status(500).send({ error: err.message });
      }
    }
  }

  async showByUserId(req: any, res: any) {
    try {
      const collections = await this.pricingCollectionService.showByUserId(req.user.id);
      res.json({ collections: collections });
    } catch (err: any) {
      res.status(500).send({ error: err.message });
    }
  }

  async downloadCollection(req: any, res: any) {
    try {
      const collectionName = req.params.collectionName;
      const userId = req.params.userId;
      const collection = await this.pricingCollectionService.showByNameAndUserId(
        collectionName,
        userId
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

      // archive.on('warning', err => {
      //   console.warn('⚠️ WARNING en archiver:', err);
      // });

      // 🚨 Event that confirms when the zip has been generated and closes the connection
      archive.on('end', () => {
        // console.log('✅ ZIP generado correctamente.');
        res.end();
      });

      // // 🚨 Event that tracks the number of entries processed
      // archive.on('progress', data => {
      //   console.log(`📦 Progreso: ${data.entries.processed} archivos añadidos.`);
      // });

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
        req.user.id,
        req.user.username
      );
      res.json(pricing);
    } catch (err: any) {
      res.status(500).send({ error: (err as Error).message });
    }
  }

  async bulkCreate(req: any, res: any) {
    try {
      const [collection, pricingsWithErrors] = await this.pricingCollectionService.bulkCreate(
        req.file,
        req.body,
        req.user.id,
        req.user.username
      );
      res.json({collection, pricingsWithErrors});
    } catch (err: any) {
      res.status(500).send({ error: (err as Error).message });
    }
  }

  async generateAnalytics(req: any, res: any) {
    if (req.user.id === req.params.userId) {
      try {
        await this.pricingCollectionService.generateCollectionAnalytics(
          req.params.collectionName,
          req.user.id
        );
        res.status(200).send({ message: 'Analytics generated successfully.' });
      } catch (err: any) {
        res.status(500).send({ error: err.message});
      }
    }else{
      res.status(403).send({ error: 'This collection is not yours.' });
    }
  }

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
        collection._id.toString(),
        req.user.id
      );
      res.json(collection);
    } catch (err: any) {
      res.status(400).send({ error: err.message });
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
      res.status(400).send({ error: err.message });
    }
  }

  _transformIndexQueryParams(indexQueryParams: Record<string, string>): CollectionIndexQueryParams {
    const transformedData: CollectionIndexQueryParams = {
      name: indexQueryParams.name,
      sortBy: indexQueryParams.sortBy,
      sort: indexQueryParams.sort ?? 'asc',
      selectedOwners: indexQueryParams.owners ? indexQueryParams.owners.split(',') : undefined,
    };

    const optionalFields = ['name', 'sortBy', 'sort', 'selectedOwners'];

    optionalFields.forEach(field => {
      if (!transformedData[field]) {
        delete transformedData[field];
      }
    });

    return transformedData;
  }
}

export default PricingCollectionController;
