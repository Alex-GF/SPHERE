import dotenv from 'dotenv';
import request from 'supertest';
import fs from 'fs/promises';
import { afterAll, beforeAll, afterEach, describe, expect, it } from 'vitest';
import { shutdownApp, TestApp } from './utils/testApp';
import { createAndLoginUser, createTestUser, deleteTestUser } from './utils/users/userTestUtils';
import { createTestCollection, createTestCollectionWithPricings } from './utils/collections/collectionTestUtils';
import { createBulkZipFixture, removeTempPaths } from './utils/pricingFixtures';
import { createPricingForUser } from './utils/pricings/pricingTestUtils';
import PricingCollectionMongoose from '../main/repositories/mongoose/models/PricingCollectionMongoose';
import testContainer from './utils/config/testContainer';
import { BASE_PATH } from './utils/config/variables';
import { randomSuffix } from './utils/helpers';
import { LeanUser } from '../main/types/models/User';

dotenv.config();

describe('Pricing Collections API integration', () => {
  let app: TestApp;
  const adminUser: LeanUser = testContainer.resolve('adminUser');
  const testUser: LeanUser = testContainer.resolve('testUser');
  const usersToDelete: Set<string> = testContainer.resolve('usersToDelete');
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
        .set('Authorization', `Bearer ${testUser.token}`);

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

      await createTestCollection({ _ownerName: owner.username });

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
      const publicCollection = await createTestCollection({ _ownerName: owner.username });
      const privateCollection = await createTestCollection({ _ownerName: owner.username, private: true });

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

      const publicCollection = await createTestCollection({ _ownerName: owner.username });
      const privateCollection = await createTestCollection({ _ownerName: owner.username, private: true });

      const response = await request(app)
        .get(`${BASE_PATH}/collections/${owner.username}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.collections)).toBe(true);
      const names = response.body.collections.map((c: any) => c.name);
      expect(names).toContain(publicCollection.name);
      expect(names).toContain(privateCollection.name);
    });

    it('returns 200, public collections and correct total number of pricings for other users', async () => {
      const owner = await createAndLoginUser('USER');
      const requester = await createAndLoginUser('USER');

      const testPricing1 = await createPricingForUser({ username: owner.username });
      const testPricing2 = await createPricingForUser({ username: owner.username });

      // create one public and one private collection
      const publicCollection = await createTestCollectionWithPricings({ _ownerName: owner.username }, [testPricing1.serviceName, testPricing2.serviceName]);
      const privateCollection = await createTestCollection({ _ownerName: owner.username, private: true });

      const response = await request(app)
        .get(`${BASE_PATH}/collections/${owner.username}`)
        .set('Authorization', `Bearer ${requester.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.collections)).toBe(true);
      // requester should only see public collections
      expect(response.body.collections.length).toBe(1);
      const names = response.body.collections.map((c: any) => c.name);
      expect(names).toContain(publicCollection.name);
      expect(names).not.toContain(privateCollection.name);
      // the public collection should have the correct number of pricings
      expect(response.body.collections[0].numberOfPricings).toBeGreaterThan(1);
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

      const p1 = await createPricingForUser({ username: owner.username });
      const p2 = await createPricingForUser({ username: owner.username });

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
      expect(Array.isArray(res.body.data.pricings)).toBe(true);
      const linkedNames = res.body.data.pricings.map((p: any) => p.name ?? p);
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
        .set('Authorization', `Bearer ${adminUser.token}`)
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
        .field('name', `BulkCollection_${randomSuffix()}`)
        .field('description', 'Collection created from bulk upload')
        .field('private', 'false')
        .attach('zip', zipPath);

      expect(res.status).toBe(201);
      if (res.body._id) collectionIdsToDelete.add(res.body._id);
      await removeTempPaths(tempPaths);
    });
  });

  describe('GET /api/v1/collections/:username/:collectionName', () => {
    it('returns 200 and collection details for owner', async () => {
      const owner = await createAndLoginUser('USER');

      const collection = await createTestCollection({ _ownerName: owner.username });

      const res = await request(app)
        .get(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe(collection.name);
    });

    it('returns 404 for non-existing collection', async () => {
      const res = await request(app)
        .get(`${BASE_PATH}/collections/${testUser.username}/nonexistent`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/v1/collections/:username/:collectionName', () => {
    it('Return 200 and allows owner to update collection metadata', async () => {
      const owner = await createAndLoginUser('USER');

      const collection = await createTestCollection({ _ownerName: owner.username });

      const res = await request(app)
        .put(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ description: 'Updated description' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe(collection.name);
    });
    
    it('Return 200 and allows owner to update collection name', async () => {
      const owner = await createAndLoginUser('USER');

      const collection = await createTestCollection({ _ownerName: owner.username });

      const res = await request(app)
        .put(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ name: 'Updated Collection Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Collection Name');
    });
    
    it('Return 200 and allows owner to update name of bulk created collection', async () => {
      const owner = await createAndLoginUser('USER');

      const { zipPath, tempPaths } = await createBulkZipFixture();
      generatedFilesToDelete.add(zipPath);

      const resCreate = await request(app)
        .post(`${BASE_PATH}/collections/${owner.username}/bulk`)
        .set('Authorization', `Bearer ${owner.token}`)
        .field('name', `BulkCollection_${randomSuffix()}`)
        .field('description', 'Collection created from bulk upload')
        .field('private', 'false')
        .attach('zip', zipPath);

      const res = await request(app)
        .put(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(resCreate.body.collection.name)}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ name: 'Updated Collection Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Collection Name');

      if (resCreate.body._id) collectionIdsToDelete.add(resCreate.body._id);
      await removeTempPaths(tempPaths);
    });
    
    it('Return 200 and allows ADMIN to update other user collection metadata', async () => {
      const owner = await createAndLoginUser('USER');

      const collection = await createTestCollection({ _ownerName: owner.username });

      const res = await request(app)
        .put(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ private: true });

      expect(res.status).toBe(200);
      expect(res.body.private).toBe(true);
    });

    it('returns 403 when USER tries to update another user collection', async () => {
      const owner = await createTestUser('USER');
      const requester = await createAndLoginUser('USER');

      const collection = await createTestCollection({ _ownerName: owner.username });

      const res = await request(app)
        .put(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${requester.token}`)
        .send({ description: 'malicious update' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/v1/collections/:username/:collectionName', () => {
    it('Return 204 and allows owner to delete own collection', async () => {
      const owner = await createAndLoginUser('USER');

      const collection = await createTestCollection({ _ownerName: owner.username });

      const res = await request(app)
        .delete(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(res.status).toBe(204);
    });
    
    it('Return 204 and allows ADMIN to delete any collection', async () => {
      const owner = await createAndLoginUser('USER');

      const collection = await createTestCollection({ _ownerName: owner.username });

      const res = await request(app)
        .delete(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(res.status).toBe(204);
    });
    
    it('Return 204 and also remove all pricings when deleting a collection', async () => {
      const owner = await createAndLoginUser('USER');

      const testPricing1 = await createPricingForUser({ username: owner.username });
      const testPricing2 = await createPricingForUser({ username: owner.username });

      const collection = await createTestCollectionWithPricings({ _ownerName: owner.username }, [testPricing1.serviceName, testPricing2.serviceName]);

      const res = await request(app)
        .delete(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}?cascade=true`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(res.status).toBe(204);
      // the pricings that belonged to the collection should also be deleted
      const resGet1 = await request(app)
        .get(`${BASE_PATH}/pricings/${owner.username}/${testPricing1.serviceName}`)
        .set('Authorization', `Bearer ${adminUser.token}`);
      expect(resGet1.status).toBe(404);
      const resGet2 = await request(app)
        .get(`${BASE_PATH}/pricings/${owner.username}/${testPricing2.serviceName}`)
        .set('Authorization', `Bearer ${adminUser.token}`);
      expect(resGet2.status).toBe(404);
    });

    it('returns 403 when USER tries to delete another user collection', async () => {
      const owner = await createTestUser('USER');
      const requester = await createAndLoginUser('USER');

      const collection = await createTestCollection({ _ownerName: owner.username });
      collectionIdsToDelete.add(collection.id);

      const res = await request(app)
        .delete(`${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}`)
        .set('Authorization', `Bearer ${requester.token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/collections/:username/:collectionName/download', () => {
    it('Returns 200 and zip content for existing collection', async () => {
      const owner = await createAndLoginUser('USER');

      const testPricing1 = await createPricingForUser({ username: owner.username });
      const testPricing2 = await createPricingForUser({ username: owner.username });

      const collection = await createTestCollectionWithPricings({ _ownerName: owner.username }, [testPricing1.serviceName, testPricing2.serviceName]);

      const res = await request(app)
        .get(
          `${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}/download`
        )
        .set('Authorization', `Bearer ${owner.token}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toMatch(/zip|application\/zip/);
    });
    
    it('Returns 400 if existing is empty', async () => {
      const owner = await createAndLoginUser('USER');

      const collection = await createTestCollection({ _ownerName: owner.username });

      const res = await request(app)
        .get(
          `${BASE_PATH}/collections/${owner.username}/${encodeURIComponent(collection.name)}/download`
        )
        .set('Authorization', `Bearer ${owner.token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
    
    it('Returns 404 if collection does not exist', async () => {
      const owner = await createAndLoginUser('USER');

      const res = await request(app)
        .get(
          `${BASE_PATH}/collections/${owner.username}/non-existent/download`
        )
        .set('Authorization', `Bearer ${owner.token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });
  });
});
