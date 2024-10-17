import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url)
console.log(__filename)
const __dirname = path.dirname(__filename)
console.log(__dirname)

const basename = path.basename(__filename)
console.log(basename)

const loadRoutes = function (app: express.Application) {
    fs.readdirSync(__dirname)
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.ts')
    })
    .forEach(async file => {
      const fileURL = pathToFileURL(path.join(__dirname, file)).href
      console.log(fileURL)
      const { default: loadFileRoutes } = await import(fileURL)
      loadFileRoutes(app)
    })
  }
  
  export default loadRoutes  