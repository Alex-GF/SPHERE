import express from "express";
import dotenv from "dotenv";
import routes from "./routes/index.ts";
import loadGlobalMiddlewares from "./middlewares/GlobalMiddlewaresLoader.ts";
import process from "node:process";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

const green = "\x1b[32m"; // Color verde
const blue = "\x1b[36m"; // Color azul
const reset = "\x1b[0m"; // Resetear el estilo al final de la línea
const bold = "\x1b[1m"; // Negrita

const initializeApp = async () => {
  dotenv.config();
  const app: express.Application = express();
  loadGlobalMiddlewares(app);
  routes(app);
  // initPassport()
  await initializeDatabase()
  // await postInitializeDatabase(app)
  return app;
};

const initializeServer = async (): Promise<{
  server: Server;
  app: express.Application;
}> => {
  const app: express.Application = await initializeApp();
  const port = process.env.SERVER_PORT || 3000;
  // Using a promise to ensure the server is started before returning it
  const server: Server = await new Promise((resolve, reject) => {
    const server = app.listen(port, (err?: Error) => {
      if (err) return reject(err);
      resolve(server);
    });
  });

  const addressInfo: AddressInfo = server.address() as AddressInfo;

  console.log(
    `  ${green}➜${reset}  ${bold}API:${reset}     ${blue}http://localhost:${bold}${addressInfo.port}/${reset}`
  );

  return { server, app };
};

const initializeDatabase = async () => {
  let connection
  try {
    switch (process.env.DATABASE_TECHNOLOGY) {
      case "mockDB":
        console.log("Connecting to mock database")
        await new Promise(resolve => setTimeout(resolve, 3000));
        break
      default:
        throw new Error("Unsupported database technology")
    }
  } catch (error) {
    console.error(error)
  }
  return connection
}

const disconnectDatabase = async (app: express.Application) => {
  try {
    switch (process.env.DATABASE_TECHNOLOGY) {
      case "mockDB":
        console.log("Disconnecting from mock database");
        break;
      default:
        throw new Error("Unsupported database technology");
    }
  } catch (error) {
    console.error(error);
  }
};

export { initializeServer, disconnectDatabase };
