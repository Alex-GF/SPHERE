import express from 'express';
import PricingCollectionController from '../controllers/PricingCollectionController';
import PricingController from '../controllers/PricingController';
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware';
import * as PricingCollectionValidator from '../controllers/validation/PricingCollectionValidation';
import { handleCollectionUpload } from '../middlewares/FileHandlerMiddleware';
import path from 'path';

const loadFileRoutes = function (app: express.Application) {
  const pricingCollectionController = new PricingCollectionController();
  const pricingController = new PricingController();

  const upload = handleCollectionUpload(
    ['zip'],
    path.resolve(process.cwd(), 'public', 'static', 'collections')
  );

  const baseUrl = (process.env.BASE_URL_PATH ?? "") + '/api/v1';

  app
    .route(baseUrl + '/collections')
    .get(pricingCollectionController.index);
    
    
  app
    .route(baseUrl + '/collections/:username')
    .get(pricingCollectionController.indexByUsername)
    .post(pricingCollectionController.create);
    
  app
    .route(baseUrl + '/collections/:username/bulk')
    .post(upload, pricingCollectionController.bulkCreate);

  app
    .route(baseUrl + '/collections/:username/:collectionName')
    .get(pricingCollectionController.show)
    .post(pricingCollectionController.generateAnalytics)
    .put(
      PricingCollectionValidator.update,
      handleValidation,
      pricingCollectionController.update
    )
    .delete(pricingCollectionController.destroy);

  app
    .route(baseUrl + '/collections/:username/:collectionName/download')
    .get(pricingCollectionController.downloadCollection);

  app
    .route(baseUrl + '/me/collections/pricings/:pricingName')
    .delete(pricingController.removePricingFromCollection);
};

export default loadFileRoutes;
