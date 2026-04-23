import dotenv from 'dotenv';
import request from 'supertest';
import fs from 'fs/promises';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getApp, shutdownApp } from './utils/testApp';
import type { TestApp } from './utils/testApp';
import { registerAndLoginUser } from './utils/integrationAuth';
import { createTempPricingYaml, removeTempPaths } from './utils/pricingFixtures';
import PricingMongoose from '../src/repositories/mongoose/models/PricingMongoose';

dotenv.config();

describe('Pricing API integration', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await getApp();
  });

  describe('GET /api/pricings', () => {
    it('returns pricing catalog with pagination metadata', async () => {
      const response = await request(app).get('/api/pricings?limit=5&offset=0');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.pricings)).toBe(true);
      expect(response.body.pricings[0]).toBeTypeOf('object');
      expect(response.body.total).toBeTypeOf('number');
    });

    it('supports filtering and sorting query parameters', async () => {
      const response = await request(app).get(
        '/api/pricings?name=Canva&sortBy=pricingName&sort=asc&selectedOwners=sphere'
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.pricings)).toBe(true);
      expect(response.body.total).toBeTypeOf('number');
    });

    it('returns paginated pricings even when private flag is missing in DB documents', async () => {
      const uniqueOwner = `legacy-owner-${Date.now()}`;

      await PricingMongoose.collection.insertOne({
        name: `LegacyPricing-${Date.now()}`,
        owner: uniqueOwner,
        version: '1.0.0',
        extractionDate: new Date(),
        currency: 'USD',
        url: '',
        yaml: 'static/pricings/templates/petclinic.yml',
        analytics: {
          configurationSpaceSize: 5,
          minSubscriptionPrice: 0,
          maxSubscriptionPrice: 10,
          numberOfFeatures: 1,
          numberOfPlans: 1,
          numberOfAddOns: 0,
        },
      });

      const response = await request(app).get(
        `/api/pricings?selectedOwners=${uniqueOwner}&limit=5&offset=0`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.pricings)).toBe(true);
      expect(response.body.pricings.length).toBeGreaterThan(0);
      expect(response.body.pricings[0].owner).toBe(uniqueOwner);
    });
  });

  describe('POST /api/pricings', () => {
    it('creates a pricing from uploaded yaml', async () => {
      const { auth } = await registerAndLoginUser(app, 'pricing-create-user');
      const fixture = await createTempPricingYaml('CreatePricing');

      const response = await request(app)
        .post('/api/pricings')
        .set('Authorization', `Bearer ${auth.token}`)
        .field('saasName', fixture.saasName)
        .field('version', fixture.version)
        .attach('yaml', fixture.filePath);

      await removeTempPaths([fixture.filePath]);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0].name).toBe(fixture.saasName);
    });

    it('returns 401 without authentication', async () => {
      const fixture = await createTempPricingYaml('CreatePricingNoAuth');

      const response = await request(app)
        .post('/api/pricings')
        .field('saasName', fixture.saasName)
        .field('version', fixture.version)
        .attach('yaml', fixture.filePath);

      await removeTempPaths([fixture.filePath]);

      expect(response.status).toBe(401);
    });

    it('returns 500 when uploading an invalid pricing file', async () => {
      const { auth } = await registerAndLoginUser(app, 'pricing-invalid-file-user');
      const invalidPath = '/tmp/invalid-pricing.yml';
      await fs.writeFile(invalidPath, 'invalid: [', 'utf8');

      const response = await request(app)
        .post('/api/pricings')
        .set('Authorization', `Bearer ${auth.token}`)
        .field('saasName', 'InvalidPricing')
        .field('version', '1.0.0')
        .attach('yaml', invalidPath);

      await removeTempPaths([invalidPath]);

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/pricings/:owner/:pricingName', () => {
    it('returns pricing versions by owner and name', async () => {
      const { auth } = await registerAndLoginUser(app, 'pricing-show-user');
      const fixture = await createTempPricingYaml('ShowPricing');

      await request(app)
        .post('/api/pricings')
        .set('Authorization', `Bearer ${auth.token}`)
        .field('saasName', fixture.saasName)
        .field('version', fixture.version)
        .attach('yaml', fixture.filePath);

      await removeTempPaths([fixture.filePath]);

      const response = await request(app).get(`/api/pricings/${auth.username}/${fixture.saasName}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(fixture.saasName);
      expect(Array.isArray(response.body.versions)).toBe(true);
      expect(response.body.versions.length).toBeGreaterThan(0);
    });

    it('returns 404 when pricing does not exist', async () => {
      const response = await request(app).get('/api/pricings/unknown-owner/unknown-pricing');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/pricings and /api/pricings/:owner/:pricingName', () => {
    it('parses a valid pricing string with updateVersion endpoint', async () => {
      const fixture = await createTempPricingYaml('UpdateVersionPricing');
      const pricingText = await fs.readFile(fixture.filePath, 'utf8');

      const response = await request(app)
        .put('/api/pricings')
        .send({ pricing: pricingText });

      await removeTempPaths([fixture.filePath]);

      expect(response.status).toBe(200);
      expect(response.body.saasName).toBeDefined();
      expect(response.body.version).toBeDefined();
    });

    it('returns 400 for invalid pricing string in updateVersion endpoint', async () => {
      const response = await request(app).put('/api/pricings').send({ pricing: 'invalid: [' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Error updating pricing');
    });

    it('updates pricing metadata for the authenticated owner', async () => {
      const { auth } = await registerAndLoginUser(app, 'pricing-update-user');
      const fixture = await createTempPricingYaml('UpdatePricing');

      await request(app)
        .post('/api/pricings')
        .set('Authorization', `Bearer ${auth.token}`)
        .field('saasName', fixture.saasName)
        .field('version', fixture.version)
        .attach('yaml', fixture.filePath);

      const response = await request(app)
        .put(`/api/pricings/${auth.username}/${fixture.saasName}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ private: true });

      await removeTempPaths([fixture.filePath]);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(fixture.saasName);
      expect(response.body.versions[0].private).toBe(true);
    });

    it('returns 422 when validation fails in update endpoint', async () => {
      const { auth } = await registerAndLoginUser(app, 'pricing-update-validation-user');
      const fixture = await createTempPricingYaml('UpdatePricingValidation');

      await request(app)
        .post('/api/pricings')
        .set('Authorization', `Bearer ${auth.token}`)
        .field('saasName', fixture.saasName)
        .field('version', fixture.version)
        .attach('yaml', fixture.filePath);

      const response = await request(app)
        .put(`/api/pricings/${auth.username}/${fixture.saasName}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ private: 'not-boolean' });

      await removeTempPaths([fixture.filePath]);

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('GET /api/pricings/:pricingId/configuration-space', () => {
    it('returns configuration space and supports pagination', async () => {
      const { auth } = await registerAndLoginUser(app, 'config-space-user');
      const fixture = await createTempPricingYaml('ConfigSpacePricing');

      const creationResponse = await request(app)
        .post('/api/pricings')
        .set('Authorization', `Bearer ${auth.token}`)
        .field('saasName', fixture.saasName)
        .field('version', fixture.version)
        .attach('yaml', fixture.filePath);

      const pricingId = creationResponse.body[0].id;

      const response = await request(app).get(
        `/api/pricings/${pricingId}/configuration-space?limit=2&offset=0`
      );

      await removeTempPaths([fixture.filePath]);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.configurationSpace)).toBe(true);
      expect(response.body.configurationSpaceSize).toBeTypeOf('number');
    });

    it('returns 500 for invalid pagination parameters', async () => {
      const response = await request(app).get(
        '/api/pricings/507f191e810c19729de860ea/configuration-space?limit=abc'
      );

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });

    it('returns 404 when pricing id does not exist for configuration space', async () => {
      const response = await request(app).get(
        '/api/pricings/507f191e810c19729de860ea/configuration-space'
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET/PUT /api/me/pricings', () => {
    it('returns owner pricings not assigned to any collection', async () => {
      const { auth } = await registerAndLoginUser(app, 'my-pricings-user');

      const response = await request(app)
        .get('/api/me/pricings')
        .set('Authorization', `Bearer ${auth.token}`);

      expect(response.status).toBe(200);
      expect(response.body.pricings).toBeDefined();
    });

    it('adds a pricing to a collection', async () => {
      const { auth } = await registerAndLoginUser(app, 'my-pricings-add-user');
      const fixture = await createTempPricingYaml('AddToCollectionPricing');

      await request(app)
        .post('/api/pricings')
        .set('Authorization', `Bearer ${auth.token}`)
        .field('saasName', fixture.saasName)
        .field('version', fixture.version)
        .attach('yaml', fixture.filePath);

      const collectionResponse = await request(app)
        .post('/api/pricings/collections')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ name: `Collection-${Date.now()}`, description: 'Test collection', pricings: [] });

      const response = await request(app)
        .put('/api/me/pricings')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ pricingName: fixture.saasName, collectionId: collectionResponse.body.id });

      await removeTempPaths([fixture.filePath]);

      expect(response.status).toBe(200);
      expect(response.body).toBe(true);
    });

    it('returns 500 when adding non-existing pricing to collection', async () => {
      const { auth } = await registerAndLoginUser(app, 'my-pricings-add-invalid-user');
      const collectionResponse = await request(app)
        .post('/api/pricings/collections')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ name: `Collection-${Date.now()}`, description: 'Test collection', pricings: [] });

      const response = await request(app)
        .put('/api/me/pricings')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ pricingName: 'NotExistingPricing', collectionId: collectionResponse.body.id });

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/pricings/:owner/:pricingName and /:pricingVersion', () => {
    it('deletes a specific pricing version', async () => {
      const { auth } = await registerAndLoginUser(app, 'delete-version-user');
      const fixture = await createTempPricingYaml('DeleteVersionPricing');

      await request(app)
        .post('/api/pricings')
        .set('Authorization', `Bearer ${auth.token}`)
        .field('saasName', fixture.saasName)
        .field('version', fixture.version)
        .attach('yaml', fixture.filePath);

      const response = await request(app)
        .delete(`/api/pricings/${auth.username}/${fixture.saasName}/${fixture.version}`)
        .set('Authorization', `Bearer ${auth.token}`);

      await removeTempPaths([fixture.filePath]);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Pricing version deleted successfully');
    });

    it('deletes a pricing by owner and name', async () => {
      const { auth } = await registerAndLoginUser(app, 'delete-pricing-user');
      const fixture = await createTempPricingYaml('DeletePricing');

      await request(app)
        .post('/api/pricings')
        .set('Authorization', `Bearer ${auth.token}`)
        .field('saasName', fixture.saasName)
        .field('version', fixture.version)
        .attach('yaml', fixture.filePath);

      const response = await request(app)
        .delete(`/api/pricings/${auth.username}/${fixture.saasName}`)
        .set('Authorization', `Bearer ${auth.token}`);

      await removeTempPaths([fixture.filePath]);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Pricing deleted successfully');
    });

    it('returns 404 when deleting a non-existing pricing version', async () => {
      const { auth } = await registerAndLoginUser(app, 'delete-version-missing-user');

      const response = await request(app)
        .delete('/api/pricings/' + auth.username + '/NotExistingPricing/0.0.0')
        .set('Authorization', `Bearer ${auth.token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('returns 500 when trying to delete another owner pricing', async () => {
      const ownerSession = await registerAndLoginUser(app, 'delete-owner-a');
      const otherSession = await registerAndLoginUser(app, 'delete-owner-b');
      const fixture = await createTempPricingYaml('DeleteOwnershipPricing');

      await request(app)
        .post('/api/pricings')
        .set('Authorization', `Bearer ${ownerSession.auth.token}`)
        .field('saasName', fixture.saasName)
        .field('version', fixture.version)
        .attach('yaml', fixture.filePath);

      const response = await request(app)
        .delete(`/api/pricings/${ownerSession.auth.username}/${fixture.saasName}`)
        .set('Authorization', `Bearer ${otherSession.auth.token}`);

      await removeTempPaths([fixture.filePath]);

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });
  });

  afterAll(async () => {
    await shutdownApp();
  });
});
