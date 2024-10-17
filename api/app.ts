import express from "express";
import dotenv from "dotenv";
import routes from "./routes/index.ts";
import loadGlobalMiddlewares from "./middlewares/GlobalMiddlewaresLoader.ts";
import process from "node:process";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

const green = '\x1b[32m';  // Color verde
const blue = '\x1b[36m';   // Color azul
const reset = '\x1b[0m';   // Resetear el estilo al final de la línea
const bold = '\x1b[1m';    // Negrita

const initializeApp = () => {
  dotenv.config();
  const app = express();
  loadGlobalMiddlewares(app);
  routes(app)
  // initPassport()
  // app.connection = await initializeDatabase()
  // await postInitializeDatabase(app)
  return app;
};

const initializeServer = async () => {
    try {
      const app = await initializeApp()
      const port = process.env.SERVER_PORT || 3000
      const server: Server = await app.listen(port)
      const addressInfo: AddressInfo = server.address() as AddressInfo
      
      console.log(`  ${green}➜${reset}  ${bold}API:${reset}     ${blue}http://localhost:${bold}${addressInfo.port}/${reset}`);
      
      return { server, app }
    } catch (error) {
      console.error(error)
    }
  }

export default initializeServer;