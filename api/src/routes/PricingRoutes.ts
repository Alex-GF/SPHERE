import express from 'express';
import container from '../config/container';
import { addFilenameToBody, handleFileUpload } from '../middlewares/FileHandlerMiddleware';
import { hasRole, isLoggedIn } from '../middlewares/AuthMiddleware';
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware';
import { checkEntityExists } from '../middlewares/EntityMiddleware';
import PricingController from '../controllers/PricingController';

const loadFileRoutes = function (app: express.Application) {
  const pricingController = new PricingController();
  const pricingService = container.resolve('pricingService');
  const upload = handleFileUpload(['yaml'], 'public/pricings');
  const baseUrl = process.env.BASE_URL_PATH;

  app
    .route(baseUrl + '/pricings')
    .get(isLoggedIn, pricingController.index)

  app
    .route(baseUrl + '/pricings/:pricingId')
    .get(isLoggedIn, checkEntityExists(pricingService, 'pricingId'), pricingController.show)
    .delete(isLoggedIn, checkEntityExists(pricingService, 'pricingId'), pricingController.destroy);
}

export default loadFileRoutes;
