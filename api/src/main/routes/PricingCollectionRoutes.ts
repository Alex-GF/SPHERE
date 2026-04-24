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
    .route(baseUrl + '/pricings/collections')
    .get(pricingCollectionController.index)
    .post(pricingCollectionController.create);

  app
    .route(baseUrl + '/pricings/collections/bulk')
    .post(upload, pricingCollectionController.bulkCreate);

  app.route(baseUrl + '/me/collections').get(pricingCollectionController.showByUserId);

  app
    .route(baseUrl + '/me/collections/pricings/:pricingName')
    .delete(pricingController.removePricingFromCollection);

  app
    .route(baseUrl + '/pricings/collections/:userId/:collectionName')
    .get(pricingCollectionController.showByNameAndUserId)
    .post(pricingCollectionController.generateAnalytics)
    .put(
      PricingCollectionValidator.update,
      handleValidation,
      pricingCollectionController.update
    )
    .delete(pricingCollectionController.destroy);

  app
    .route(baseUrl + '/pricings/collections/:userId/:collectionName/download')
    .get(pricingCollectionController.downloadCollection);
};

export default loadFileRoutes;
