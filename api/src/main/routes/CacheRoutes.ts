import express from 'express';
import CacheController from '../controllers/CacheController';
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware';
import * as CacheValidator from '../controllers/validation/CacheValidation';


const loadFileRoutes = function (app: express.Application) {
  const cacheController = new CacheController();

  const baseUrl = (process.env.BASE_URL_PATH ?? "") + '/api/v1';

  app
    .route(baseUrl + '/cache')
    .get(cacheController.get)
    .post(CacheValidator.set, handleValidation, cacheController.set);
};

export default loadFileRoutes;
