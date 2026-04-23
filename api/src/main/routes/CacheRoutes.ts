import express from 'express';
import CacheController from '../controllers/CacheController';


const loadFileRoutes = function (app: express.Application) {
  const cacheController = new CacheController();

  const baseUrl = process.env.BASE_URL_PATH;

  app
    .route(baseUrl + '/cache/get')
    .get(cacheController.get)

  app.route(baseUrl + '/cache/set')
    .post(cacheController.set)
};

export default loadFileRoutes;
