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

  const allowedOrigins = ['http://localhost', 'https://sphere.score.us.es'];
  const forbiddenOrigin = 'https://example.com';

  const requestWithOrigin = (method: 'get' | 'post', url: string, origin: string) => {
    return request(app)[method](url).set('Origin', origin);
  };

  beforeAll(async () => {
    app = testContainer.resolve('app');
  });

  describe('GET /api/cache', () => {
    it('allows localhost and sphere.score.us.es without ADMIN auth', async () => {
      for (const origin of allowedOrigins) {
        const key = `integration-cache-get-${origin.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}`;
        const value = { origin, allowed: true };

        await request(app)
          .post(`${BASE_PATH}/cache`)
          .set('Authorization', `Bearer ${adminUser.token}`)
          .send({ key, value, expirationInSeconds: 120 });

        const response = await requestWithOrigin('get', `${BASE_PATH}/cache?key=${key}`, origin);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(value);
      }
    });

    it('rejects non-allowed origins without ADMIN auth', async () => {
      const response = await requestWithOrigin('get', `${BASE_PATH}/cache?key=missing-key`, forbiddenOrigin);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    it('allows ADMIN auth for non-allowed origins', async () => {
      const key = `integration-cache-get-admin-${Date.now()}`;
      const value = { admin: true };

      await request(app)
        .post(`${BASE_PATH}/cache`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ key, value, expirationInSeconds: 120 });

      const response = await requestWithOrigin('get', `${BASE_PATH}/cache?key=${key}`, forbiddenOrigin)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(value);
    });

    it('returns null when key does not exist', async () => {
      const response = await request(app)
        .get(`${BASE_PATH}/cache?key=non-existing-key`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });

  describe('POST /api/cache', () => {
    it('allows localhost and sphere.score.us.es without ADMIN auth', async () => {
      for (const origin of allowedOrigins) {
        const key = `integration-cache-post-${origin.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}`;
        const value = { origin, allowed: true };

        const response = await requestWithOrigin('post', `${BASE_PATH}/cache`, origin).send({
          key,
          value,
          expirationInSeconds: 120,
        });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Cache set successfully');
      }
    });

    it('rejects non-allowed origins without ADMIN auth', async () => {
      const response = await requestWithOrigin('post', `${BASE_PATH}/cache`, forbiddenOrigin).send({
        key: `integration-cache-forbidden-${Date.now()}`,
        value: { forbidden: true },
        expirationInSeconds: 120,
      });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Forbidden');
    });

    it('allows ADMIN auth for non-allowed origins', async () => {
      const key = `integration-cache-admin-${Date.now()}`;
      const value = { admin: true };

      const response = await requestWithOrigin('post', `${BASE_PATH}/cache`, forbiddenOrigin)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ key, value, expirationInSeconds: 120 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Cache set successfully');
    });

    it('returns 409 when setting different value for existing key', async () => {
      const key = `integration-cache-conflict-${Date.now()}`;

      await request(app)
        .post(`${BASE_PATH}/cache`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ key, value: { v: 1 }, expirationInSeconds: 120 });

      const response = await request(app)
        .post(`${BASE_PATH}/cache`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ key, value: { v: 2 }, expirationInSeconds: 120 });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('Value already exists in cache');
    });

    it('uses default expiration when expiration is not provided', async () => {
      const key = `integration-cache-default-exp-${Date.now()}`;

      const setResponse = await request(app)
        .post(`${BASE_PATH}/cache`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({
          key,
          value: { defaultExpiration: true },
        });

      expect(setResponse.status).toBe(200);

      const getResponse = await request(app)
        .get(`${BASE_PATH}/cache?key=${key}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body).toEqual({ defaultExpiration: true });
    });

    it('returns 422 when key is missing in set endpoint', async () => {
      const response = await request(app)
        .post(`${BASE_PATH}/cache`)
        .send({ value: { a: 1 } });

      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
    });

    it('returns 422 when value is missing in set endpoint', async () => {
      const response = await request(app)
        .post(`${BASE_PATH}/cache`)
        .send({ key: 'integration-cache-missing-value' });

      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
    });
  });

  afterAll(async () => {
    await shutdownApp();
  });
});
