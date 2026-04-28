import dotenv from 'dotenv';
import request from 'supertest';
import fs from 'fs/promises';
import { afterAll, beforeAll, afterEach, describe, expect, it } from 'vitest';
import { shutdownApp, TestApp } from './utils/testApp';
import { createAndLoginUser, createTestUser, deleteTestUser } from './utils/users/userTestUtils';
import { createTestCollection } from './utils/collections/collectionTestUtils';
import { createBulkZipFixture, removeTempPaths } from './utils/pricingFixtures';
import { createPricingForUser } from './utils/pricings/pricingTestUtils';
import PricingCollectionMongoose from '../main/repositories/mongoose/models/PricingCollectionMongoose';
import testContainer from './utils/config/testContainer';
import { BASE_PATH, TEST_PASSWORD } from './utils/config/variables';
import { randomSuffix } from './utils/helpers';

dotenv.config();

describe('Pricing Collections API integration', () => {
  let app: TestApp;
  let adminUser: any;
  let testUser: any;
  let adminApiToken: string;
  let userApiToken: string;
  const usersToDelete: Set<string> = testContainer.resolve('usersToDelete');
  const generatedFilesToDelete: Set<string> = testContainer.resolve('generatedFilesToDelete');
  const collectionIdsToDelete: Set<string> = testContainer.resolve('collectionIdsToDelete');

  beforeAll(async () => {
    app = testContainer.resolve('app');
    adminUser = await createTestUser('ADMIN', 'testAdmin');
    testUser = await createTestUser('USER', 'testUser');

    const responseAdminLogin = await request(app).post(`${BASE_PATH}/users/login`).send({
      loginField: adminUser.username,
      password: TEST_PASSWORD,
    });

    const responseUserLogin = await request(app).post(`${BASE_PATH}/users/login`).send({
      loginField: testUser.username,
      password: TEST_PASSWORD,
    });

    adminApiToken = responseAdminLogin.body.token;
    userApiToken = responseUserLogin.body.token;
  });

  afterEach(async () => {
    for (const username of usersToDelete) {
      await deleteTestUser(username);
    }
    usersToDelete.clear();

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

  describe('GET /api/v1/collections', () => {
    it('returns 200 and paginated collections list with valid Bearer Authorization header', async () => {
      const response = await request(app)
        .get(`${BASE_PATH}/collections?limit=10&offset=0`)
        .set('Authorization', `Bearer ${userApiToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.collections)).toBe(true);
    });

    it('returns 401 when missing Authorization header', async () => {
      const response = await request(app).get(`${BASE_PATH}/collections`);
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('returns 401 with malformed Authorization header', async () => {
      const response = await request(app)
        .get(`${BASE_PATH}/collections`)
        .set('Authorization', 'Token malformed');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/collections/:username', () => {
    it('returns 200 and user collections when owner requests own collections', async () => {
      const owner = await createAndLoginUser('USER');

      await createTestCollection(owner.username);

      const response = await request(app)
        .get(`${BASE_PATH}/collections/${owner.username}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.collections)).toBe(true);
    });

    it('returns 200 and public collections for other users', async () => {
      const owner = await createAndLoginUser('USER');
      const requester = await createAndLoginUser('USER');

      // create one public and one private collection
      const publicCollection = await createTestCollection(owner.username);
      const privateCollection = await createTestCollection(owner.username, {
        private: true,
      });

      const response = await request(app)
        .get(`${BASE_PATH}/collections/${owner.username}`)
        .set('Authorization', `Bearer ${requester.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.collections)).toBe(true);
      // requester should only see public collections
      const names = response.body.collections.map((c: any) => c.name);
      expect(names).toContain(publicCollection.name);
      expect(names).not.toContain(privateCollection.name);
    });

    it('returns 200 and all collections when ADMIN requests another username', async () => {
      const owner = await createTestUser('USER');

      const publicCollection = await createTestCollection(owner.username);
      const privateCollection = await createTestCollection(owner.username, {
        private: true,
      });

      const response = await request(app)
        .get(`${BASE_PATH}/collections/${owner.username}`)
        .set('Authorization', `Bearer ${adminApiToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.collections)).toBe(true);
      const names = response.body.collections.map((c: any) => c.name);
      expect(names).toContain(publicCollection.name);
      expect(names).toContain(privateCollection.name);
    });

    it('returns 401 when missing Authorization header', async () => {
      const response = await request(app).get(`${BASE_PATH}/collections/${testUser.username}`);
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/v1/collections/:username', () => {
    it('Return 201 when user with requested username tries to create a collection', async () => {
      const owner = await createAndLoginUser('USER');

      const payload = {
        name: `Collection_${randomSuffix()}`,
        description: 'A test collection',
        private: false,
      };

      const res = await request(app)
        .post(`${BASE_PATH}/collections/${owner.username}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send(payload);

      expect(res.status).toBe(201);
      if (res.body._id) collectionIdsToDelete.add(res.body._id);
    });

    it('Return 201 when providing pricings list', async () => {
      const owner = await createAndLoginUser('USER');

      const p1 = await createPricingForUser({ token: owner.token!, username: owner.username });
      const p2 = await createPricingForUser({ token: owner.token!, username: owner.username });

      const payload = {
        name: `CollectionWithPricings_${randomSuffix()}`,
        description: 'Collection that references existing pricings',
        private: false,
        pricings: [p1.serviceName, p2.serviceName],
      };

      const res = await request(app)
        .post(`${BASE_PATH}/collections/${owner.username}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send(payload);

      expect(res.status).toBe(201);
      // response should include the linked pricings
      expect(Array.isArray(res.body.pricings)).toBe(true);
      const linkedNames = res.body.pricings.map((p: any) => p.name ?? p);
      expect(linkedNames).toEqual(expect.arrayContaining([p1.serviceName, p2.serviceName]));
    });

    it('Return 201 when ADMIN creates a collection for another user', async () => {
      const owner = await createAndLoginUser('USER');

      const payload = {
        name: `Collection_${randomSuffix()}`,
        description: 'A test collection',
        private: false,
      };

      const res = await request(app)
        .post(`${BASE_PATH}/collections/${owner.username}`)
        .set('Authorization', `Bearer ${adminApiToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      if (res.body._id) collectionIdsToDelete.add(res.body._id);
    });

    it('returns 403 when USER tries to create a collection for another user', async () => {
      const owner = await createAndLoginUser('USER');
      const other = await createAndLoginUser('USER');

      const payload = { name: `Collection_${randomSuffix()}`, private: false };

      const res = await request(app)
        .post(`${BASE_PATH}/collections/${other.username}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send(payload);

      expect(res.status).toBe(403);
    });

    it('returns 422 when required fields are missing', async () => {
      const owner = await createAndLoginUser('USER');

      const res = await request(app)
        .post(`${BASE_PATH}/collections/${owner.username}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          description: 'no name',
        });
      expect(res.status).toBe(422);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  });

  describe('POST /api/v1/collections/:username/bulk', () => {
    it('accepts a zip file and creates a collection from bulk pricings', async () => {
      const owner = await createAndLoginUser('USER');

      const { zipPath, tempPaths } = await createBulkZipFixture();
      generatedFilesToDelete.add(zipPath);

      const res = await request(app)
        .post(`${BASE_PATH}/collections/${owner.username}/bulk`)
        .set('Authorization', `Bearer ${owner.token}`)
        .attach('zip', zipPath);

      expect([200, 201]).toContain(res.status);
      if (res.body._id) collectionIdsToDelete.add(res.body._id);
      await removeTempPaths(tempPaths);
    });
  });

  describe('GET /api/v1/collections/:username/:collectionName', () => {
    it('returns 200 and collection details for owner', async () => {
      const owner = await createAndLoginUser('USER');

      const collection = await createTestCollection(owner.username);
      collectionIdsToDelete.add(collection.id);

      const res = await request(app)
        .get(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe(collection.name);
    });

    it('returns 404 for non-existing collection', async () => {
      const res = await request(app)
        .get(`${BASE_PATH}/collections/${testUser.username}/nonexistent`)
        .set('Authorization', `Bearer ${userApiToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/collections/:username/:collectionName', () => {
    it('allows owner to update collection metadata', async () => {
      const owner = await createAndLoginUser('USER');

      const collection = await createTestCollection(owner.username);
      collectionIdsToDelete.add(collection.id);

      const res = await request(app)
        .put(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ description: 'Updated description' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe(collection.name);
    });

    it('returns 403 when USER tries to update another user collection', async () => {
      const owner = await createTestUser('USER');
      const requester = await createAndLoginUser('USER');

      const collection = await createTestCollection(owner.username);
      collectionIdsToDelete.add(collection.id);

      const res = await request(app)
        .put(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${requester.token}`)
        .send({ description: 'malicious update' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/v1/collections/:username/:collectionName', () => {
    it('allows owner to delete own collection', async () => {
      const owner = await createAndLoginUser('USER');

      const collection = await createTestCollection(owner.username);
      // do not add to delete set so it's removed by API

      const res = await request(app)
        .delete(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(res.status).toBe(200);
    });

    it('returns 403 when USER tries to delete another user collection', async () => {
      const owner = await createTestUser('USER');
      const requester = await createAndLoginUser('USER');

      const collection = await createTestCollection(owner.username);
      collectionIdsToDelete.add(collection.id);

      const res = await request(app)
        .delete(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${requester.token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/collections/:username/:collectionName/download', () => {
    it('returns 200 and zip content for existing collection (even if empty)', async () => {
      const owner = await createAndLoginUser('USER');

      const collection = await createTestCollection(owner.username);
      collectionIdsToDelete.add(collection.id);

      const res = await request(app)
        .get(
          `${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}/download`
        )
        .set('Authorization', `Bearer ${owner.token}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toMatch(/zip|application\/zip/);
    });
  });
});
