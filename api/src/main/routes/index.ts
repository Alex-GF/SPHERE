import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);

const loadRoutes = async function (app: express.Application) {
  return Promise.all(
    fs
      .readdirSync(__dirname)
      .filter(file => {
        return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.ts';
      })
      .map(async file => {
        const fileURL = pathToFileURL(path.join(__dirname, file)).href;
        return import(fileURL);
      })
  ).then(routes => {
    return routes.forEach(route => {
      const loadFileRoutes = route.default;
      loadFileRoutes(app);
    });
  });
};

export default loadRoutes;
