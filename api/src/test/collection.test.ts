import dotenv from 'dotenv';
import request from 'supertest';
import fs from 'fs/promises';
import { afterAll, beforeAll, afterEach, describe, expect, it } from 'vitest';
import { getApp, shutdownApp, TestApp } from './utils/testApp';
import { createTestUser, deleteTestUser } from './utils/users/userTestUtils';
import { createTestCollection } from './utils/collections/collectionTestUtils';
import {
  createBulkZipFixture,
  removeTempPaths,
} from './utils/pricingFixtures';
import PricingCollectionMongoose from '../main/repositories/mongoose/models/PricingCollectionMongoose';

dotenv.config();

describe('Pricing Collections API integration', () => {
  let app: TestApp;
  const usersToDelete = new Set<string>();
  const generatedFilesToDelete = new Set<string>();
  const collectionIdsToDelete = new Set<string>();
  let adminUser: any;
  let testUser: any;
  let adminApiToken: string;
  let userApiToken: string;
  const basePath = (process.env.BASE_URL_PATH ?? '') + '/api/v1';

  const randomSuffix = () => Math.random().toString(36).substring(2, 10);

  const createCollectionViaApi = async (token: string, username: string, body: any) => {
    return request(app)
      .post(`${basePath}/collections/${username}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  };

  beforeAll(async () => {
    app = await getApp();
    adminUser = await createTestUser('ADMIN');
    testUser = await createTestUser('USER');
    usersToDelete.add(adminUser.username);
    usersToDelete.add(testUser.username);

    const responseAdminLogin = await request(app).post(`${basePath}/users/login`).send({
      loginField: adminUser.username,
      password: process.env.TEST_PASSWORD,
    });

    const responseUserLogin = await request(app).post(`${basePath}/users/login`).send({
      loginField: testUser.username,
      password: process.env.TEST_PASSWORD,
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
        .get(`${basePath}/collections?limit=10&offset=0`)
        .set('Authorization', `Bearer ${userApiToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.collections)).toBe(true);
    });

    it('returns 401 when missing Authorization header', async () => {
      const response = await request(app).get(`${basePath}/collections`);
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('returns 401 with malformed Authorization header', async () => {
      const response = await request(app)
        .get(`${basePath}/collections`)
        .set('Authorization', 'Token malformed');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/v1/collections/:username', () => {
    it('returns 200 and user collections when owner requests own collections', async () => {
      const owner = await createTestUser('USER');
      usersToDelete.add(owner.username);

      const ownerLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: owner.username,
        password: process.env.TEST_PASSWORD,
      });

      const collection = await createTestCollection(owner.username);
      collectionIdsToDelete.add(collection.id);

      const response = await request(app)
        .get(`${basePath}/collections/${owner.username}`)
        .set('Authorization', `Bearer ${ownerLogin.body.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.collections)).toBe(true);
    });

    it('returns 200 and public collections for other users', async () => {
      const owner = await createTestUser('USER');
      const requester = await createTestUser('USER');
      usersToDelete.add(owner.username);
      usersToDelete.add(requester.username);

      const ownerLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: owner.username,
        password: process.env.TEST_PASSWORD,
      });

      const requesterLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: requester.username,
        password: process.env.TEST_PASSWORD,
      });

      // create one public and one private collection
      const publicCollection = await createTestCollection(owner.username);
      const privateCollection = new PricingCollectionMongoose({
        name: `Private_${randomSuffix()}`,
        description: 'private',
        owner: owner.username,
        private: true,
        analytics: {},
      });
      const savedPrivate = await privateCollection.save();
      collectionIdsToDelete.add(publicCollection.id);
      collectionIdsToDelete.add(savedPrivate._id.toString());

      const response = await request(app)
        .get(`${basePath}/collections/${owner.username}`)
        .set('Authorization', `Bearer ${requesterLogin.body.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.collections)).toBe(true);
      // requester should only see public collections
      const names = response.body.collections.map((c: any) => c.name);
      expect(names).toContain(publicCollection.name);
      expect(names).not.toContain(savedPrivate.name);
    });

    it('returns 200 and all collections when ADMIN requests another username', async () => {
      const owner = await createTestUser('USER');
      usersToDelete.add(owner.username);

      const ownerLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: owner.username,
        password: process.env.TEST_PASSWORD,
      });

      const publicCollection = await createTestCollection(owner.username);
      const privateCollection = new PricingCollectionMongoose({
        name: `Private_${randomSuffix()}`,
        description: 'private',
        owner: owner.username,
        private: true,
        analytics: {},
      });
      const savedPrivate = await privateCollection.save();
      collectionIdsToDelete.add(publicCollection.id);
      collectionIdsToDelete.add(savedPrivate._id.toString());

      const response = await request(app)
        .get(`${basePath}/collections/${owner.username}`)
        .set('Authorization', `Bearer ${adminApiToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.collections)).toBe(true);
      const names = response.body.collections.map((c: any) => c.name);
      expect(names).toContain(publicCollection.name);
      expect(names).toContain(savedPrivate.name);
    });

    it('returns 401 when missing Authorization header', async () => {
      const response = await request(app).get(`${basePath}/collections/${testUser.username}`);
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/v1/collections/:username', () => {
    it('allows owner to create a collection and returns 201 or 200', async () => {
      const owner = await createTestUser('USER');
      usersToDelete.add(owner.username);

      const ownerLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: owner.username,
        password: process.env.TEST_PASSWORD,
      });

      const payload = {
        name: `Collection_${randomSuffix()}`,
        description: 'A test collection',
        private: false,
      };

      const res = await createCollectionViaApi(ownerLogin.body.token, owner.username, payload);
      expect([200, 201]).toContain(res.status);
      if (res.body._id) collectionIdsToDelete.add(res.body._id);
    });

    it('returns 403 when USER tries to create a collection for another user', async () => {
      const owner = await createTestUser('USER');
      const other = await createTestUser('USER');
      usersToDelete.add(owner.username);
      usersToDelete.add(other.username);

      const ownerLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: owner.username,
        password: process.env.TEST_PASSWORD,
      });

      const payload = { name: `Collection_${randomSuffix()}`, private: false };
      const res = await createCollectionViaApi(ownerLogin.body.token, other.username, payload);
      expect(res.status).toBe(403);
    });

    it('returns 422 when required fields are missing', async () => {
      const owner = await createTestUser('USER');
      usersToDelete.add(owner.username);

      const ownerLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: owner.username,
        password: process.env.TEST_PASSWORD,
      });

      const res = await createCollectionViaApi(ownerLogin.body.token, owner.username, { description: 'no name' });
      expect(res.status).toBe(422);
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
  });

  describe('POST /api/v1/collections/:username/bulk', () => {
    it('accepts a zip file and creates a collection from bulk pricings', async () => {
      const owner = await createTestUser('USER');
      usersToDelete.add(owner.username);

      const ownerLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: owner.username,
        password: process.env.TEST_PASSWORD,
      });

      const { zipPath, tempPaths } = await createBulkZipFixture();
      generatedFilesToDelete.add(zipPath);

      const res = await request(app)
        .post(`${basePath}/collections/${owner.username}/bulk`)
        .set('Authorization', `Bearer ${ownerLogin.body.token}`)
        .attach('zip', zipPath);

      expect([200, 201]).toContain(res.status);
      if (res.body._id) collectionIdsToDelete.add(res.body._id);
      await removeTempPaths(tempPaths);
    });
  });

  describe('GET /api/v1/collections/:username/:collectionName', () => {
    it('returns 200 and collection details for owner', async () => {
      const owner = await createTestUser('USER');
      usersToDelete.add(owner.username);

      const ownerLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: owner.username,
        password: process.env.TEST_PASSWORD,
      });

      const collection = await createTestCollection(owner.username);
      collectionIdsToDelete.add(collection.id);

      const res = await request(app)
        .get(`${basePath}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${ownerLogin.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe(collection.name);
    });

    it('returns 404 for non-existing collection', async () => {
      const res = await request(app)
        .get(`${basePath}/collections/${testUser.username}/nonexistent`) 
        .set('Authorization', `Bearer ${userApiToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/collections/:username/:collectionName', () => {
    it('allows owner to update collection metadata', async () => {
      const owner = await createTestUser('USER');
      usersToDelete.add(owner.username);

      const ownerLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: owner.username,
        password: process.env.TEST_PASSWORD,
      });

      const collection = await createTestCollection(owner.username);
      collectionIdsToDelete.add(collection.id);

      const res = await request(app)
        .put(`${basePath}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${ownerLogin.body.token}`)
        .send({ description: 'Updated description' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe(collection.name);
    });

    it('returns 403 when USER tries to update another user collection', async () => {
      const owner = await createTestUser('USER');
      const requester = await createTestUser('USER');
      usersToDelete.add(owner.username);
      usersToDelete.add(requester.username);

      const ownerLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: owner.username,
        password: process.env.TEST_PASSWORD,
      });

      const requesterLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: requester.username,
        password: process.env.TEST_PASSWORD,
      });

      const collection = await createTestCollection(owner.username);
      collectionIdsToDelete.add(collection.id);

      const res = await request(app)
        .put(`${basePath}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${requesterLogin.body.token}`)
        .send({ description: 'malicious update' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/v1/collections/:username/:collectionName', () => {
    it('allows owner to delete own collection', async () => {
      const owner = await createTestUser('USER');
      usersToDelete.add(owner.username);

      const ownerLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: owner.username,
        password: process.env.TEST_PASSWORD,
      });

      const collection = await createTestCollection(owner.username);
      // do not add to delete set so it's removed by API

      const res = await request(app)
        .delete(`${basePath}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${ownerLogin.body.token}`);

      expect(res.status).toBe(200);
    });

    it('returns 403 when USER tries to delete another user collection', async () => {
      const owner = await createTestUser('USER');
      const requester = await createTestUser('USER');
      usersToDelete.add(owner.username);
      usersToDelete.add(requester.username);

      const ownerLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: owner.username,
        password: process.env.TEST_PASSWORD,
      });

      const requesterLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: requester.username,
        password: process.env.TEST_PASSWORD,
      });

      const collection = await createTestCollection(owner.username);
      collectionIdsToDelete.add(collection.id);

      const res = await request(app)
        .delete(`${basePath}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${requesterLogin.body.token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/collections/:username/:collectionName/download', () => {
    it('returns 200 and zip content for existing collection (even if empty)', async () => {
      const owner = await createTestUser('USER');
      usersToDelete.add(owner.username);

      const ownerLogin = await request(app).post(`${basePath}/users/login`).send({
        loginField: owner.username,
        password: process.env.TEST_PASSWORD,
      });

      const collection = await createTestCollection(owner.username);
      collectionIdsToDelete.add(collection.id);

      const res = await request(app)
        .get(`${basePath}/collections/${owner.username}/${encodeURIComponent(collection.name)}/download`)
        .set('Authorization', `Bearer ${ownerLogin.body.token}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toMatch(/zip|application\/zip/);
    });
  });
});
