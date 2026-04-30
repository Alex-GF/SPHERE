import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { shutdownApp, TestApp } from './utils/testApp';
import { createAndLoginUser, createTestUser, deleteTestUser } from './utils/users/userTestUtils';
import { LeanUser } from '../main/types/models/User';
import { BASE_PATH, TEST_PASSWORD } from './utils/config/variables';
import PricingCollectionMongoose from '../main/repositories/mongoose/models/PricingCollectionMongoose';
import testContainer from './utils/config/testContainer';
import { createAndTrackPricingYaml, createPricingForUser, createValidPricingYaml } from './utils/pricings/pricingTestUtils';
import { createCollectionForUser } from './utils/collections/collectionTestUtils';
import { randomSuffix } from './utils/helpers';
import PricingMongoose from '../main/repositories/mongoose/models/PricingMongoose';

dotenv.config();

describe('Pricings API integration', () => {
  let app: TestApp;
  const adminUser: LeanUser = testContainer.resolve('adminUser');
  const testUser: LeanUser = testContainer.resolve('testUser');
  const usersToDelete: Set<string> = testContainer.resolve('usersToDelete');
  const pricingsToDelete: Set<string> = testContainer.resolve('pricingsToDelete');
  const generatedFilesToDelete: Set<string> = testContainer.resolve('generatedFilesToDelete');
  const collectionIdsToDelete: Set<string> = testContainer.resolve('collectionIdsToDelete');

  beforeAll(async () => {
    app = testContainer.resolve('app');
  });

  afterEach(async () => {
    for (const username of usersToDelete) {
      await deleteTestUser(username);
    }
    usersToDelete.clear();

    for (const pricingId of pricingsToDelete) {
      await PricingMongoose.deleteOne({ _id: pricingId });
    }
    pricingsToDelete.clear();

    for (const filePath of generatedFilesToDelete) {
      await fs.rm(filePath, { force: true });
    }
    generatedFilesToDelete.clear();

    for (const collectionId of collectionIdsToDelete) {
      await PricingCollectionMongoose.deleteOne({ _id: collectionId });
    }
    collectionIdsToDelete.clear();
  });

  afterAll(async () => {
    await shutdownApp();
  });

  describe('GET /api/v1/pricings', () => {
    it('Return 200 and paginated pricing list with valid Bearer Authorization header.', async () => {
      const user = await createAndLoginUser('USER');
      
      for (let i = 0; i < 15; i++) {
        await createPricingForUser({
          username: user.username,
          isPrivate: false,
        });
      }
      
      const response = await request(app)
        .get(`${BASE_PATH}/pricings?limit=12&offset=0`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.pricings)).toBe(true);
      if (response.body.total !== undefined) {
        expect(typeof response.body.total).toBe('number');
      }
      expect(response.body.pricings.length).toBe(12);
    });

    it('Return 200 and filtered/sorted pricing list when query parameters are provided.', async () => {
      const response = await request(app)
        .get(
          `${BASE_PATH}/pricings?name=zoom&sortBy=name&sort=asc&min-subscription=0&max-subscription=9999&selectedOwners=${testUser.username}&limit=5&offset=0`
        )
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.pricings)).toBe(true);
      expect(typeof response.body.total).toBe('number');
    });

    it('Return 401 and error object with missing Authorization header.', async () => {
      const response = await request(app).get(`${BASE_PATH}/pricings`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with malformed Authorization header.', async () => {
      const response = await request(app)
        .get(`${BASE_PATH}/pricings`)
        .set('Authorization', 'Token malformed');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with invalid Bearer token.', async () => {
      const response = await request(app)
        .get(`${BASE_PATH}/pricings`)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/v1/pricings', () => {
    it('Return 200 and updated pricing object when sending a valid pricing YAML string.', async () => {
      const serviceName = `updated_pricing_${randomSuffix()}`;
      const version = `3.1.${Math.floor(Math.random() * 1000)}`;
      const filePath = await createAndTrackPricingYaml(serviceName, version);
      const pricingYaml = await fs.readFile(filePath, 'utf8');

      const response = await request(app)
        .put(`${BASE_PATH}/pricings`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ pricing: pricingYaml });

      expect(response.status).toBe(200);
      expect(response.body.version).toBeDefined();
      expect(response.body.features).toBeDefined();
      expect(response.body.usageLimits).toBeDefined();
      expect(response.body.plans).toBeDefined();
    });

    it('Return 401 and error object with missing Authorization header.', async () => {
      const response = await request(app)
        .put(`${BASE_PATH}/pricings`)
        .send({ pricing: 'saasName: Invalid' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 422 with malformed pricing text (must not return 500).', async () => {
      const response = await request(app)
        .put(`${BASE_PATH}/pricings`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ pricing: '::::invalid-yaml::::' });

      expect(response.status).toBe(422);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/pricings/:username', () => {
    it('Return 200 and pricing list with owner requesting own username.', async () => {
      const owner = await createTestUser('USER');
      usersToDelete.add(owner.username);

      const ownerLogin = await request(app).post(`${BASE_PATH}/users/login`).send({
        loginField: owner.username,
        password: TEST_PASSWORD,
      });

      await createPricingForUser({
        username: owner.username,
        isPrivate: false,
      });

      const response = await request(app)
        .get(`${BASE_PATH}/pricings/${owner.username}`)
        .set('Authorization', `Bearer ${ownerLogin.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.pricings)).toBe(true);
    });

    it('Return 200 and public pricing list with regular user requesting another username.', async () => {
      const owner = await createTestUser('USER');
      const requester = await createAndLoginUser('USER');
      usersToDelete.add(owner.username);
      usersToDelete.add(requester.username);

      await createPricingForUser({
        username: owner.username,
        isPrivate: false,
      });
      
      await createPricingForUser({
        username: owner.username,
        isPrivate: true,
      });

      const response = await request(app)
        .get(`${BASE_PATH}/pricings/${owner.username}`)
        .set('Authorization', `Bearer ${requester.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.pricings)).toBe(true);
      expect(response.body.pricings.length).toBe(1);
    });
    
    it('Return 200 and public/private pricing list with ADMIN user requesting another username.', async () => {
      const owner = await createTestUser('USER');
      const requester = await createAndLoginUser('ADMIN');

      await createPricingForUser({
        username: owner.username,
        isPrivate: false,
      });
      
      await createPricingForUser({
        username: owner.username,
        isPrivate: true,
      });

      const response = await request(app)
        .get(`${BASE_PATH}/pricings/${owner.username}`)
        .set('Authorization', `Bearer ${requester.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.pricings)).toBe(true);
      expect(response.body.pricings.length).toBe(2);
    });

    it('Return 401 and error object with missing Authorization header.', async () => {
      const response = await request(app).get(`${BASE_PATH}/pricings/${testUser.username}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with malformed Authorization header.', async () => {
      const response = await request(app)
        .get(`${BASE_PATH}/pricings/${testUser.username}`)
        .set('Authorization', 'Token malformed');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/v1/pricings/:username', () => {
    it('Return 200 and pricing object when owner uploads valid pricing YAML.', async () => {
      const owner = await createAndLoginUser('USER');

      const fixture = await createValidPricingYaml(`pricing_${randomSuffix()}`);

      const response = await request(app)
        .post(`${BASE_PATH}/pricings/${owner.username}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .field('private', 'false')
        .field('saasName', fixture.saasName)
        .field('version', fixture.version)
        .attach('yaml', fixture.filePath);

      expect(response.status).toBe(200);
      expect(response.body.name ?? response.body[0]?.name).toBe(fixture.saasName);
      expect(response.body.owner ?? response.body[0]?.owner).toBe(owner.username);
    });

    it('Return 403 with USER role trying to create pricing for another user.', async () => {
      const owner = await createAndLoginUser('USER');
      const other = await createTestUser('USER');

      const filePath = await createAndTrackPricingYaml(`pricing_${randomSuffix()}`);

      const response = await request(app)
        .post(`${BASE_PATH}/pricings/${other.username}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .field('private', 'false')
        .attach('yaml', filePath);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('Return 422 and validation errors object with missing private field.', async () => {
      const owner = await createAndLoginUser('USER');

      const response = await request(app)
        .post(`${BASE_PATH}/pricings/${owner.username}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .field('saasName', `pricing_${randomSuffix()}`);

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Return 401 and error object with missing Authorization header.', async () => {
      const response = await request(app)
        .post(`${BASE_PATH}/pricings/${testUser.username}`)
        .field('private', 'false');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/pricings/:username/:pricingName', () => {
    it('Return 200 and pricing details with owner requesting own pricing.', async () => {
      const owner = await createAndLoginUser('USER');

      const { serviceName } = await createPricingForUser({
        username: owner.username,
        isPrivate: false,
      });

      const response = await request(app)
        .get(`${BASE_PATH}/pricings/${owner.username}/${serviceName}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(serviceName);
      expect(Array.isArray(response.body.versions)).toBe(true);
    });

    it('Return 200 and pricing details with admin requesting another user pricing.', async () => {
      const owner = await createTestUser('USER');

      const { serviceName } = await createPricingForUser({
        username: owner.username,
        isPrivate: false,
      });

      const response = await request(app)
        .get(`${BASE_PATH}/pricings/${owner.username}/${serviceName}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(serviceName);
      expect(Array.isArray(response.body.versions)).toBe(true);
    });

    it('Return 404 with regular user requesting private pricing from another user.', async () => {
      const owner = await createTestUser('USER');
      const requester = await createAndLoginUser('USER');

      const { serviceName } = await createPricingForUser({
        username: owner.username,
        isPrivate: true,
      });

      const response = await request(app)
        .get(`${BASE_PATH}/pricings/${owner.username}/${serviceName}`)
        .set('Authorization', `Bearer ${requester.token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with missing Authorization header.', async () => {
      const response = await request(app).get(
        `${BASE_PATH}/pricings/${testUser.username}/nonexistent_pricing`
      );

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 404 and error object with non-existing pricing name.', async () => {
      const response = await request(app)
        .get(`${BASE_PATH}/pricings/${testUser.username}/nonexistent_pricing`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/v1/pricings/:username/:pricingName', () => {
    it('Return 200 and updated pricing details when owner updates metadata.', async () => {
      const owner = await createAndLoginUser('USER');

      const { serviceName } = await createPricingForUser({
        username: owner.username,
      });

      const response = await request(app)
        .put(`${BASE_PATH}/pricings/${owner.username}/${serviceName}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ url: 'https://example.com/pricing' });

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.versions)).toBe(true);
    });

    it('Return 200 and updated pricing details when ADMIN updates another user pricing.', async () => {
      const owner = await createTestUser('USER');

      const { serviceName } = await createPricingForUser({
        username: owner.username,
      });

      const response = await request(app)
        .put(`${BASE_PATH}/pricings/${owner.username}/${serviceName}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ url: 'https://example.com/admin-update' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(serviceName);
      expect(Array.isArray(response.body.versions)).toBe(true);
    });

    it('Return 403 with USER role trying to update another user pricing.', async () => {
      const owner = await createTestUser('USER');
      const requester = await createAndLoginUser('USER');

      const { serviceName } = await createPricingForUser({
        username: owner.username,
      });

      const response = await request(app)
        .put(`${BASE_PATH}/pricings/${owner.username}/${serviceName}`)
        .set('Authorization', `Bearer ${requester.token}`)
        .send({ private: true });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('Return 422 and validation errors object with invalid url field.', async () => {
      const owner = await createAndLoginUser('USER');

      const { serviceName } = await createPricingForUser({
        username: owner.username,
      });

      const response = await request(app)
        .put(`${BASE_PATH}/pricings/${owner.username}/${serviceName}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ url: 'not-a-url' });

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Return 404 and error object with non-existing pricing.', async () => {
      const response = await request(app)
        .put(`${BASE_PATH}/pricings/${testUser.username}/nonexistent_pricing`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ private: true });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/v1/pricings/:username/:pricingName', () => {
    it('Return 200 and success message when owner deletes own pricing.', async () => {
      const owner = await createAndLoginUser('USER');

      const { serviceName } = await createPricingForUser({
        username: owner.username,
      });

      const response = await request(app)
        .delete(`${BASE_PATH}/pricings/${owner.username}/${serviceName}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });

    it('Return 200 and success message when ADMIN deletes another user pricing.', async () => {
      const owner = await createTestUser('USER');

      const { serviceName } = await createPricingForUser({
        username: owner.username,
      });

      const response = await request(app)
        .delete(`${BASE_PATH}/pricings/${owner.username}/${serviceName}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });

    it('Return 403 with USER role trying to delete another user pricing.', async () => {
      const owner = await createTestUser('USER');
      const requester = await createAndLoginUser('USER');

      const { serviceName } = await createPricingForUser({
        username: owner.username,
      });

      const response = await request(app)
        .delete(`${BASE_PATH}/pricings/${owner.username}/${serviceName}`)
        .set('Authorization', `Bearer ${requester.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('Return 404 with non-existing pricing (must not return 500).', async () => {
      const response = await request(app)
        .delete(`${BASE_PATH}/pricings/${testUser.username}/nonexistent_pricing`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/v1/pricings/:username/:pricingName/:pricingVersion', () => {
    it('Return 200 and success message when owner deletes a specific pricing version.', async () => {
      const owner = await createAndLoginUser('USER');

      const serviceName = `pricing_${randomSuffix()}`;
      const version = `2.0.${Math.floor(Math.random() * 1000)}`;
      await createPricingForUser({
        username: owner.username,
        serviceName,
        version,
      });

      const response = await request(app)
        .delete(`${BASE_PATH}/pricings/${owner.username}/${serviceName}/${version}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });

    it('Return 200 and success message when ADMIN deletes another user pricing version.', async () => {
      const owner = await createTestUser('USER');

      const serviceName = `pricing_${randomSuffix()}`;
      const version = `2.1.${Math.floor(Math.random() * 1000)}`;
      await createPricingForUser({
        username: owner.username,
        serviceName,
        version,
      });

      const response = await request(app)
        .delete(`${BASE_PATH}/pricings/${owner.username}/${serviceName}/${version}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });

    it('Return 403 with USER role trying to delete another user pricing version.', async () => {
      const owner = await createTestUser('USER');
      const requester = await createAndLoginUser('USER');

      const serviceName = `pricing_${randomSuffix()}`;
      const version = `2.2.${Math.floor(Math.random() * 1000)}`;
      await createPricingForUser({
        username: owner.username,
        serviceName,
        version,
      });

      const response = await request(app)
        .delete(`${BASE_PATH}/pricings/${owner.username}/${serviceName}/${version}`)
        .set('Authorization', `Bearer ${requester.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('Return 404 with non-existing pricing version (must not return 500).', async () => {
      const response = await request(app)
        .delete(`${BASE_PATH}/pricings/${testUser.username}/nonexistent_pricing/9.9.9`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/v1/me/pricings', () => {
    it('Return 200 and success message when adding own pricing to a valid collection.', async () => {
      const owner = await createAndLoginUser('USER');

      const collection = await createCollectionForUser(owner.username);

      const { serviceName } = await createPricingForUser({
        username: owner.username,
      });

      const response = await request(app)
        .put(`${BASE_PATH}/me/pricings`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ pricingName: serviceName, collectionId: collection.id });

      expect(response.status).toBe(200);
      expect(response.body.message).toBeDefined();
    });

    it('Return 404 and error object when pricing does not exist for authenticated user.', async () => {
      const owner = await createAndLoginUser('USER');

      const collection = await createCollectionForUser(owner.username);

      const response = await request(app)
        .put(`${BASE_PATH}/me/pricings`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ pricingName: `nonexistent_${randomSuffix()}`, collectionId: collection.id });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with missing Authorization header.', async () => {
      const response = await request(app)
        .put(`${BASE_PATH}/me/pricings`)
        .send({ pricingName: 'any-pricing', collectionId: '507f1f77bcf86cd799439011' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });
});

