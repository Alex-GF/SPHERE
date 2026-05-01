import dotenv from 'dotenv';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { shutdownApp, TestApp } from './utils/testApp';
import testContainer from './utils/config/testContainer';
import { BASE_PATH } from './utils/config/variables';
import { LeanUser } from '../main/types/models/User';

dotenv.config();

describe('Cache API integration', () => {
  let app: TestApp;
  const adminUser: LeanUser = testContainer.resolve('adminUser');

  beforeAll(async () => {
    app = testContainer.resolve('app');
  });

  describe('POST /api/cache/set and GET /api/cache/get', () => {
    it('stores and retrieves a cache value', async () => {
      const key = `integration-cache-${Date.now()}`;
      const value = { sample: true, size: 10 };

      const setResponse = await request(app)
        .post(`${BASE_PATH}/cache/set`)
        .send({
          key,
          value,
          expirationInSeconds: 120,
        });

      expect(setResponse.status).toBe(200);
      expect(setResponse.body.message).toBe('Cache set successfully');

      const getResponse = await request(app)
        .get(`${BASE_PATH}/cache/get?key=${key}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toEqual(value);
    });

    it('returns null when key does not exist', async () => {
      const response = await request(app)
        .get(`${BASE_PATH}/cache/get?key=non-existing-key`);

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });

    it('returns 409 when setting different value for existing key', async () => {
      const key = `integration-cache-conflict-${Date.now()}`;

      await request(app)
        .post(`${BASE_PATH}/cache/set`)
        .send({ key, value: { v: 1 }, expirationInSeconds: 120 });

      const response = await request(app)
        .post(`${BASE_PATH}/cache/set`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ key, value: { v: 2 }, expirationInSeconds: 120 });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('Value already exists in cache');
    });

    it('uses default expiration when expiration is not provided', async () => {
      const key = `integration-cache-default-exp-${Date.now()}`;

      const setResponse = await request(app)
        .post(`${BASE_PATH}/cache/set`)
        .send({
          key,
          value: { defaultExpiration: true },
        });

      expect(setResponse.status).toBe(200);

      const getResponse = await request(app)
        .get(`${BASE_PATH}/cache/get?key=${key}`)
        .set('Authorization', `Bearer ${adminUser.token}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toEqual({ defaultExpiration: true });
    });

    it('returns 422 when key is missing in set endpoint', async () => {
      const response = await request(app)
        .post(`${BASE_PATH}/cache/set`)
        .send({ value: { a: 1 } });

      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
    });
    
    it('returns 422 when value is missing in set endpoint', async () => {
      const response = await request(app)
        .post(`${BASE_PATH}/cache/set`)
        .send({ key: 'integration-cache-missing-value' });

      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
    });
  });

  afterAll(async () => {
    await shutdownApp();
  });
});
