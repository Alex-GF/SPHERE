import type { Server } from 'http';
import { initializeServer, disconnectDatabase } from '../../src/app';
import { Application } from 'express';

let testServer: Server | null = null;
let testApp: Application | null = null;

const getApp = async (): Promise<Server> => {
  if (!testServer) {
    const { server, app } = await initializeServer();
    testServer = server;
    testApp = app;
  }
  return testServer;
};

const shutdownApp = async () => {
  if (testServer) {
    await testServer.close();
    await disconnectDatabase(testApp!);
    testApp = null;
    testServer = null;
  }
};

const getIdType = () => {
  switch (process.env.DATABASE_TECHNOLOGY) {
    case 'mockDB':
      return String;
    default:
      throw new Error('Unsupported database technology');
  }
};

export { getApp, shutdownApp, getIdType };
