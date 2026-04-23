import request from 'supertest';
import type { Server } from 'http';
import { initializeServer, disconnectDatabase } from '../../main/app';
import { Application } from 'express';

let testServer: Server | null = null;
let testApp: Application | null = null;

export type TestApp = Parameters<typeof request>[0];

const getApp = async (): Promise<TestApp> => {
  if (!testServer) {
    const { server, app } = await initializeServer();
    testServer = server;
    testApp = app;
  }
  return testServer as TestApp;
};

const shutdownApp = async () => {
  if (testServer) {
    await testServer.close();
    await disconnectDatabase();
    testApp = null;
    testServer = null;
  }
};

export { getApp, shutdownApp };
