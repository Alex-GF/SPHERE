import express from 'express';
import PricingCollectionController from '../controllers/PricingCollectionController';
import { isLoggedIn } from '../middlewares/AuthMiddleware';
import PricingController from '../controllers/PricingController';
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware';
import * as PricingCollectionValidator from '../controllers/validation/PricingCollectionValidation';

const loadFileRoutes = function (app: express.Application) {
  const pricingCollectionController = new PricingCollectionController();
  const pricingController = new PricingController();

  const baseUrl = process.env.BASE_URL_PATH;

  app
    .route(baseUrl + '/pricings/collections')
    .get(pricingCollectionController.index)
    .post(isLoggedIn, pricingCollectionController.create);

  app.route(baseUrl + '/me/collections')
  .get(isLoggedIn, pricingCollectionController.showByUserId);

  app.route(baseUrl + '/me/collections/pricings/:pricingName')
  .delete(isLoggedIn, pricingController.removePricingFromCollection);

  app
    .route(baseUrl + '/pricings/collections/:userId/:collectionName')
    .get(pricingCollectionController.showByNameAndUserId)
    .put(isLoggedIn, PricingCollectionValidator.update, handleValidation, pricingCollectionController.update);
};

export default loadFileRoutes;
