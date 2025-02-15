import express from 'express';
import { isLoggedIn } from '../middlewares/AuthMiddleware';
import PricingController from '../controllers/PricingController';
import { handlePricingUpload } from '../middlewares/FileHandlerMiddleware';
import * as PricingValidator from '../controllers/validation/PricingValidation';
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware';

const loadFileRoutes = function (app: express.Application) {
  const pricingController = new PricingController();
  const upload = handlePricingUpload(['yaml'], './public/static/pricings/uploadedDataset');

  const baseUrl = process.env.BASE_URL_PATH;

  app
    .route(baseUrl + '/pricings')
    .get(pricingController.index)
    .post(isLoggedIn, upload, pricingController.create);

  app
    .route(baseUrl + '/pricings/:owner/:pricingName')
    .get(pricingController.show)
    .put(isLoggedIn, PricingValidator.update, handleValidation, pricingController.update)
    .delete(isLoggedIn, pricingController.destroyByNameAndOwner);

  app
    .route(baseUrl + '/me/pricings')
    .get(isLoggedIn, pricingController.indexByUserWithoutCollection)
    .put(isLoggedIn, pricingController.addPricingToCollection);
};

export default loadFileRoutes;
