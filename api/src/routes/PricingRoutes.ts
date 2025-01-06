import express from 'express';
import container from '../config/container';
import { addFilenameToBody, handleFileUpload } from '../middlewares/FileHandlerMiddleware';
import { hasRole, isLoggedIn } from '../middlewares/AuthMiddleware';
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware';
import { checkEntityExists } from '../middlewares/EntityMiddleware';
import PricingController from '../controllers/PricingController';
import multer from 'multer';

const loadFileRoutes = function (app: express.Application) {
  const pricingController = new PricingController();
  const pricingService = container.resolve('pricingService');
  const upload = handleFileUpload(['yaml'], './public/assets/pricings/uploadedDataset');
  
  const baseUrl = process.env.BASE_URL_PATH;

  app
    .route(baseUrl + '/pricings')
    .get(isLoggedIn, pricingController.index)
    .post(
      // isLoggedIn, 
      //     hasRole('admin'), 
          upload,
          pricingController.create);

  app
    .route(baseUrl + '/pricings/:pricingName')
    .get(isLoggedIn, pricingController.show);
}

export default loadFileRoutes;
