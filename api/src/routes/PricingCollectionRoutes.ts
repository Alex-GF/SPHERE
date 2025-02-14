import express from 'express';
import PricingCollectionController from '../controllers/PricingCollectionController';
import { isLoggedIn } from '../middlewares/AuthMiddleware';

const loadFileRoutes = function (app: express.Application) {
  const pricingCollectionController = new PricingCollectionController();

  const baseUrl = process.env.BASE_URL_PATH;

  app
    .route(baseUrl + '/pricings/collections')
    .get(pricingCollectionController.index)
    .post(isLoggedIn, pricingCollectionController.create);

  app.route(baseUrl + '/me/collections').get(isLoggedIn, pricingCollectionController.showByUserId);

  app
    .route(baseUrl + '/pricings/collections/:userId/:collectionName')
    .get(pricingCollectionController.showByNameAndUserId);

  app.route(baseUrl + '/collections/test').get(pricingCollectionController.test);
};

export default loadFileRoutes;
