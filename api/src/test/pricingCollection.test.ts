// import dotenv from 'dotenv';
// import request from 'supertest';
// import mongoose from 'mongoose';
// import { afterAll, beforeAll, describe, expect, it } from 'vitest';
// import { getApp, shutdownApp } from './utils/testApp';
// import type { TestApp } from './utils/testApp';
// import { registerAndLoginUser } from './utils/integrationAuth';
// import { createBulkZipFixture, createTempPricingYaml, removeTempPaths } from './utils/pricingFixtures';
// import PricingCollectionMongoose from '../src/repositories/mongoose/models/PricingCollectionMongoose';

// dotenv.config();

// describe('Pricing collections API integration', () => {
//   let app: TestApp;

//   beforeAll(async () => {
//     app = await getApp();
//   });

//   describe('GET /api/pricings/collections', () => {
//     it('returns collections list with total count', async () => {
//       const response = await request(app).get('/api/pricings/collections?limit=10&offset=0');

//       expect(response.status).toBe(200);
//       expect(Array.isArray(response.body.collections)).toBe(true);
//       expect(response.body.total).toBeTypeOf('number');
//     });

//     it('supports filters and sorting in collections list', async () => {
//       const response = await request(app).get(
//         '/api/pricings/collections?name=IEEE&sortBy=numberOfPricings&sort=desc&owners=sphere'
//       );

//       expect(response.status).toBe(200);
//       expect(Array.isArray(response.body.collections)).toBe(true);
//       expect(response.body.total).toBeTypeOf('number');
//     });
//   });

//   describe('POST /api/pricings/collections', () => {
//     it('creates a collection for authenticated user', async () => {
//       const { auth } = await registerAndLoginUser(app, 'collection-create-user');

//       const response = await request(app)
//         .post('/api/pricings/collections')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({
//           name: `Collection-${Date.now()}`,
//           description: 'Integration collection',
//           pricings: [],
//         });

//       expect(response.status).toBe(200);
//       expect(response.body.name).toContain('Collection-');
//     });

//     it('returns 401 without authentication', async () => {
//       const response = await request(app).post('/api/pricings/collections').send({
//         name: `Collection-${Date.now()}`,
//         pricings: [],
//       });

//       expect(response.status).toBe(401);
//     });

//     it('returns 409 when creating a duplicate collection name for same user', async () => {
//       const { auth } = await registerAndLoginUser(app, 'collection-duplicate-user');
//       const collectionName = `DuplicateCollection-${Date.now()}`;

//       await request(app)
//         .post('/api/pricings/collections')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({ name: collectionName, pricings: [] });

//       const response = await request(app)
//         .post('/api/pricings/collections')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({ name: collectionName, pricings: [] });

//       expect(response.status).toBe(409);
//       expect(response.body.error).toBeDefined();
//     });
//   });

//   describe('POST /api/pricings/collections/bulk', () => {
//     it('creates collection from a bulk zip and reports parse errors', async () => {
//       const { auth } = await registerAndLoginUser(app, 'bulk-collection-user');
//       const fixture = await createBulkZipFixture();

//       const response = await request(app)
//         .post('/api/pricings/collections/bulk')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .field('name', `BulkCollection-${Date.now()}`)
//         .field('description', 'Bulk integration test')
//         .attach('zip', fixture.zipPath);

//       await removeTempPaths([...fixture.tempPaths, fixture.zipPath]);

//       expect(response.status).toBe(200);
//       expect(response.body.collection.name).toContain('BulkCollection-');
//       expect(Array.isArray(response.body.pricingsWithErrors)).toBe(true);
//     });

//     it('returns 401 for bulk creation without authentication', async () => {
//       const response = await request(app)
//         .post('/api/pricings/collections/bulk')
//         .field('name', `BulkCollectionNoAuth-${Date.now()}`);

//       expect(response.status).toBe(401);
//     });
//   });

//   describe('GET /api/me/collections', () => {
//     it('returns current user collections', async () => {
//       const { auth } = await registerAndLoginUser(app, 'my-collections-user');

//       await request(app)
//         .post('/api/pricings/collections')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({ name: `MyCollections-${Date.now()}`, pricings: [] });

//       const response = await request(app)
//         .get('/api/me/collections')
//         .set('Authorization', `Bearer ${auth.token}`);

//       expect(response.status).toBe(200);
//       expect(Array.isArray(response.body.collections)).toBe(true);
//     });
//   });

//   describe('GET/POST/PUT/DELETE /api/pricings/collections/:userId/:collectionName', () => {
//     it('shows collection by owner and name', async () => {
//       const { auth } = await registerAndLoginUser(app, 'show-collection-user');
//       const collectionName = `ShowCollection-${Date.now()}`;

//       await request(app)
//         .post('/api/pricings/collections')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({ name: collectionName, pricings: [] });

//       const response = await request(app).get(`/api/pricings/collections/${auth.id}/${collectionName}`);

//       expect(response.status).toBe(200);
//       expect(response.body.name).toBe(collectionName);
//       expect(response.body.analytics).toBeDefined();
//     });

//     it('returns default analytics structure when collection has no analytics field', async () => {
//       const { auth } = await registerAndLoginUser(app, 'show-legacy-collection-user');
//       const collectionName = `LegacyCollection-${Date.now()}`;

//       await PricingCollectionMongoose.collection.insertOne({
//         name: collectionName,
//         _ownerId: new mongoose.Types.ObjectId(auth.id),
//       });

//       const response = await request(app).get(`/api/pricings/collections/${auth.id}/${collectionName}`);

//       expect(response.status).toBe(200);
//       expect(response.body.analytics).toBeDefined();
//       expect(Array.isArray(response.body.analytics.evolutionOfPlans.dates)).toBe(true);
//       expect(Array.isArray(response.body.analytics.evolutionOfPlans.values)).toBe(true);
//       expect(Array.isArray(response.body.analytics.evolutionOfAddOns.dates)).toBe(true);
//       expect(Array.isArray(response.body.analytics.evolutionOfFeatures.values)).toBe(true);
//       expect(
//         Array.isArray(response.body.analytics.evolutionOfConfigurationSpaceSize.values)
//       ).toBe(true);
//     });

//     it('returns 404 when collection does not exist by owner and name', async () => {
//       const response = await request(app).get(
//         '/api/pricings/collections/507f191e810c19729de860ea/not-existing-collection'
//       );

//       expect(response.status).toBe(404);
//       expect(response.body.error).toBeDefined();
//     });

//     it('generates analytics when collection belongs to authenticated user', async () => {
//       const { auth } = await registerAndLoginUser(app, 'analytics-collection-user');
//       const collectionName = `AnalyticsCollection-${Date.now()}`;

//       await request(app)
//         .post('/api/pricings/collections')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({ name: collectionName, pricings: [] });

//       const response = await request(app)
//         .post(`/api/pricings/collections/${auth.id}/${collectionName}`)
//         .set('Authorization', `Bearer ${auth.token}`);

//       expect(response.status).toBe(200);
//       expect(response.body.message).toBe('Analytics generated successfully.');
//     });

//     it('returns 403 when generating analytics for another user collection', async () => {
//       const ownerSession = await registerAndLoginUser(app, 'analytics-owner-user');
//       const otherSession = await registerAndLoginUser(app, 'analytics-other-user');
//       const collectionName = `AnalyticsForbidden-${Date.now()}`;

//       await request(app)
//         .post('/api/pricings/collections')
//         .set('Authorization', `Bearer ${ownerSession.auth.token}`)
//         .send({ name: collectionName, pricings: [] });

//       const response = await request(app)
//         .post(`/api/pricings/collections/${ownerSession.auth.id}/${collectionName}`)
//         .set('Authorization', `Bearer ${otherSession.auth.token}`);

//       expect(response.status).toBe(403);
//       expect(response.body.error).toBe('This collection is not yours.');
//     });

//     it('updates collection metadata', async () => {
//       const { auth } = await registerAndLoginUser(app, 'update-collection-user');
//       const collectionName = `UpdateCollection-${Date.now()}`;

//       await request(app)
//         .post('/api/pricings/collections')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({ name: collectionName, pricings: [] });

//       const response = await request(app)
//         .put(`/api/pricings/collections/${auth.id}/${collectionName}`)
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({ description: 'Updated description' });

//       expect(response.status).toBe(200);
//       expect(response.body.description).toBe('Updated description');
//     });

//     it('returns 422 when update validation fails', async () => {
//       const { auth } = await registerAndLoginUser(app, 'update-collection-validation-user');
//       const collectionName = `UpdateCollectionValidation-${Date.now()}`;

//       await request(app)
//         .post('/api/pricings/collections')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({ name: collectionName, pricings: [] });

//       const response = await request(app)
//         .put(`/api/pricings/collections/${auth.id}/${collectionName}`)
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({ private: 'invalid' });

//       expect(response.status).toBe(422);
//       expect(Array.isArray(response.body.errors)).toBe(true);
//     });

//     it('deletes collection without cascade', async () => {
//       const { auth } = await registerAndLoginUser(app, 'delete-collection-user');
//       const collectionName = `DeleteCollection-${Date.now()}`;

//       await request(app)
//         .post('/api/pricings/collections')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({ name: collectionName, pricings: [] });

//       const response = await request(app)
//         .delete(`/api/pricings/collections/${auth.id}/${collectionName}?cascade=false`)
//         .set('Authorization', `Bearer ${auth.token}`);

//       expect(response.status).toBe(200);
//       expect(response.body.message).toBe('Successfully deleted.');
//     });

//     it('returns 400 when deleting a collection of another user', async () => {
//       const ownerSession = await registerAndLoginUser(app, 'delete-collection-owner-user');
//       const otherSession = await registerAndLoginUser(app, 'delete-collection-other-user');
//       const collectionName = `DeleteForbiddenCollection-${Date.now()}`;

//       await request(app)
//         .post('/api/pricings/collections')
//         .set('Authorization', `Bearer ${ownerSession.auth.token}`)
//         .send({ name: collectionName, pricings: [] });

//       const response = await request(app)
//         .delete(`/api/pricings/collections/${ownerSession.auth.id}/${collectionName}?cascade=false`)
//         .set('Authorization', `Bearer ${otherSession.auth.token}`);

//       expect(response.status).toBe(400);
//       expect(response.body.error).toBeDefined();
//     });
//   });

//   describe('GET /api/pricings/collections/:userId/:collectionName/download', () => {
//     it('downloads collection as zip when collection has pricings', async () => {
//       const { auth } = await registerAndLoginUser(app, 'download-collection-user');
//       const fixture = await createTempPricingYaml('DownloadCollectionPricing');
//       const collectionName = `DownloadCollection-${Date.now()}`;

//       await request(app)
//         .post('/api/pricings')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .field('saasName', fixture.saasName)
//         .field('version', fixture.version)
//         .attach('yaml', fixture.filePath);

//       const createdCollection = await request(app)
//         .post('/api/pricings/collections')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({ name: collectionName, pricings: [] });

//       await request(app)
//         .put('/api/me/pricings')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({ pricingName: fixture.saasName, collectionId: createdCollection.body.id });

//       const response = await request(app).get(
//         `/api/pricings/collections/${auth.id}/${collectionName}/download`
//       );

//       await removeTempPaths([fixture.filePath]);

//       expect(response.status).toBe(200);
//       expect(response.headers['content-type']).toContain('application/zip');
//     });

//     it('returns 500 when collection does not exist', async () => {
//       const response = await request(app).get(
//         '/api/pricings/collections/507f191e810c19729de860ea/non-existing-collection/download'
//       );

//       expect(response.status).toBe(500);
//       expect(response.body.error).toBeDefined();
//     });
//   });

//   describe('DELETE /api/me/collections/pricings/:pricingName', () => {
//     it('removes pricing from collection', async () => {
//       const { auth } = await registerAndLoginUser(app, 'remove-from-collection-user');
//       const fixture = await createTempPricingYaml('RemoveFromCollectionPricing');
//       const collectionName = `RemoveCollection-${Date.now()}`;

//       await request(app)
//         .post('/api/pricings')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .field('saasName', fixture.saasName)
//         .field('version', fixture.version)
//         .attach('yaml', fixture.filePath);

//       const collectionResponse = await request(app)
//         .post('/api/pricings/collections')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({ name: collectionName, pricings: [] });

//       await request(app)
//         .put('/api/me/pricings')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .send({ pricingName: fixture.saasName, collectionId: collectionResponse.body.id });

//       await request(app)
//         .post(`/api/pricings/collections/${auth.id}/${collectionName}`)
//         .set('Authorization', `Bearer ${auth.token}`);

//       const response = await request(app)
//         .delete(`/api/me/collections/pricings/${fixture.saasName}`)
//         .set('Authorization', `Bearer ${auth.token}`);

//       await removeTempPaths([fixture.filePath]);

//       expect(response.status).toBe(200);
//       expect(response.body).toBe(true);
//     });

//     it('returns 500 when removing pricing not present in any collection', async () => {
//       const { auth } = await registerAndLoginUser(app, 'remove-missing-pricing-user');
//       const fixture = await createTempPricingYaml('RemoveMissingCollectionPricing');

//       await request(app)
//         .post('/api/pricings')
//         .set('Authorization', `Bearer ${auth.token}`)
//         .field('saasName', fixture.saasName)
//         .field('version', fixture.version)
//         .attach('yaml', fixture.filePath);

//       const response = await request(app)
//         .delete(`/api/me/collections/pricings/${fixture.saasName}`)
//         .set('Authorization', `Bearer ${auth.token}`);

//       await removeTempPaths([fixture.filePath]);

//       expect(response.status).toBe(500);
//       expect(response.body.error).toBeDefined();
//     });
//   });

//   afterAll(async () => {
//     await shutdownApp();
//   });
// });
