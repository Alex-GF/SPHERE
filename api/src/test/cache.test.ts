// import dotenv from 'dotenv';
// import request from 'supertest';
// import { afterAll, beforeAll, describe, expect, it } from 'vitest';
// import { getApp, shutdownApp } from './utils/testApp';
// import type { TestApp } from './utils/testApp';

// dotenv.config();

// describe('Cache API integration', () => {
//   let app: TestApp;

//   beforeAll(async () => {
//     app = await getApp();
//   });

//   describe('POST /api/cache/set and GET /api/cache/get', () => {
//     it('stores and retrieves a cache value', async () => {
//       const key = `integration-cache-${Date.now()}`;
//       const value = { sample: true, size: 10 };

//       const setResponse = await request(app).post('/api/cache/set').send({
//         key,
//         value,
//         expirationInSeconds: 120,
//       });

//       expect(setResponse.status).toBe(200);
//       expect(setResponse.body.message).toBe('Cache set successfully');

//       const getResponse = await request(app).get(`/api/cache/get?key=${key}`);

//       expect(getResponse.status).toBe(200);
//       expect(getResponse.body).toEqual(value);
//     });

//     it('returns null when key does not exist', async () => {
//       const response = await request(app).get('/api/cache/get?key=non-existing-key');

//       expect(response.status).toBe(200);
//       expect(response.body).toBeNull();
//     });

//     it('returns 500 when setting different value for existing key', async () => {
//       const key = `integration-cache-conflict-${Date.now()}`;

//       await request(app).post('/api/cache/set').send({ key, value: { v: 1 }, expirationInSeconds: 120 });

//       const response = await request(app)
//         .post('/api/cache/set')
//         .send({ key, value: { v: 2 }, expirationInSeconds: 120 });

//       expect(response.status).toBe(500);
//       expect(response.body.error).toContain('Value already exists in cache');
//     });

//     it('uses default expiration when expiration is not provided', async () => {
//       const key = `integration-cache-default-exp-${Date.now()}`;

//       const setResponse = await request(app).post('/api/cache/set').send({
//         key,
//         value: { defaultExpiration: true },
//       });

//       expect(setResponse.status).toBe(200);

//       const getResponse = await request(app).get(`/api/cache/get?key=${key}`);
//       expect(getResponse.status).toBe(200);
//       expect(getResponse.body).toEqual({ defaultExpiration: true });
//     });

//     it('returns 500 when key is missing in set endpoint', async () => {
//       const response = await request(app).post('/api/cache/set').send({ value: { a: 1 } });

//       expect(response.status).toBe(500);
//       expect(response.body.error).toBeDefined();
//     });
//   });

//   afterAll(async () => {
//     await shutdownApp();
//   });
// });
