import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import bodyParser from "body-parser";

const loadGlobalMiddlewares = (app: express.Application) => {
  app.use(express.json())
  app.use(cors())
  app.use(helmet(
    {
      crossOriginResourcePolicy: false // allows loading of files from /public
    }
  ))
  app.use(express.static('public'))
  app.use(bodyParser.json({limit: '2mb'}))
  app.use(bodyParser.urlencoded({limit: '2mb', extended: true}))
}

export default loadGlobalMiddlewares
