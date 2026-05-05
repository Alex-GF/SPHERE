import express from 'express';
import PricingController from '../controllers/PricingController';
import { handlePricingUpload } from '../middlewares/FileHandlerMiddleware';
import * as PricingValidator from '../controllers/validation/PricingValidation';
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware';
import path from 'path';

const loadFileRoutes = function (app: express.Application) {
  const pricingController = new PricingController();
  const upload = handlePricingUpload(
    ['yaml'],
    path.resolve(process.cwd(), 'public', 'static', 'pricings', 'uploaded')
  );

  const baseUrl = (process.env.BASE_URL_PATH ?? "") + '/api/v1';

  app
    .route(baseUrl + '/pricings')
    .get(pricingController.index)
    .put(pricingController.updateVersion);

  app
    .route(baseUrl + '/pricings/:organizationId')
    .get(pricingController.indexByOwner)
    .post(upload, PricingValidator.create, handleValidation, pricingController.create);

  app
    .route(baseUrl + '/pricings/:organizationId/:pricingName')
    .get(pricingController.show)
    .put(PricingValidator.update, handleValidation, pricingController.update)
    .delete(pricingController.destroyByNameAndOwner);

  app
    .route(baseUrl + '/pricings/:organizationId/:pricingName/:pricingVersion')
    .get(pricingController.getConfigurationSpace)
    .delete(pricingController.destroyVersionByNameAndOwner);

  app
    .route(baseUrl + '/me/pricings')
    .put(pricingController.addPricingToCollection);
};

export default loadFileRoutes;
