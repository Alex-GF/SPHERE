import dotenv from 'dotenv';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { shutdownApp, TestApp } from './utils/testApp';
import { BASE_PATH } from './utils/config/variables';
import testContainer from './utils/config/testContainer';
import { createAndLoginUser, createTestUser, deleteTestUser } from './utils/users/userTestUtils';
import { createTestOrganization, createMembership, cleanupOrganization } from './utils/organizations/organizationTestUtils';
import { randomSuffix } from './utils/helpers';
import { LeanUser } from '../main/types/models/User';
import OrganizationMongoose from '../main/repositories/mongoose/models/OrganizationMongoose';
import OrganizationMembershipMongoose from '../main/repositories/mongoose/models/OrganizationMembershipMongoose';
import OrganizationInvitationMongoose from '../main/repositories/mongoose/models/OrganizationInvitationMongoose';

dotenv.config();

describe('Organizations API integration', () => {
  let app: TestApp;
  const adminUser: LeanUser = testContainer.resolve('adminUser');
  const testUser: LeanUser = testContainer.resolve('testUser');
  const usersToDelete: Set<string> = testContainer.resolve('usersToDelete');
  const orgsToDelete: Set<string> = testContainer.resolve('orgsToDelete');
  const membershipsToDelete: Set<string> = testContainer.resolve('membershipsToDelete');
  const invitationsToDelete: Set<string> = testContainer.resolve('invitationsToDelete');

  beforeAll(async () => {
    app = testContainer.resolve('app');
  });

  afterEach(async () => {
    for (const username of usersToDelete) {
      await deleteTestUser(username);
    }
    usersToDelete.clear();

    for (const orgId of orgsToDelete) {
      await cleanupOrganization(orgId);
    }
    orgsToDelete.clear();
    membershipsToDelete.clear();
    invitationsToDelete.clear();
  });

  afterAll(async () => {
    await shutdownApp();
  });

  // =========================================================================
  // GET /orgs
  // =========================================================================
  describe('GET /orgs', () => {
    it('returns 200 and array of organizations with ADMIN role', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .get(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      const ids = response.body.map((o: any) => o.id);
      expect(ids).toContain(org.id);
    });

    it('returns organizations sorted by creation date (newest first)', async () => {
      const owner = await createAndLoginUser('USER');
      const org1 = await createTestOrganization(owner.token, { name: `org_a_${randomSuffix()}`, displayName: 'Org A' });
      const org2 = await createTestOrganization(owner.token, { name: `org_b_${randomSuffix()}`, displayName: 'Org B' });

      const response = await request(app)
        .get(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      const ids = response.body.map((o: any) => o.id);
      const idx1 = ids.indexOf(org1.id);
      const idx2 = ids.indexOf(org2.id);
      expect(idx2).toBeLessThan(idx1);
    });

    it('returns each organization with expected fields', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token, {
        displayName: 'Field Check Org',
        description: 'A test org for field validation',
      });

      const response = await request(app)
        .get(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      const found = response.body.find((o: any) => o.id === org.id);
      expect(found).toBeDefined();
      expect(found.name).toBeDefined();
      expect(found.displayName).toBe('Field Check Org');
      expect(found.description).toBe('A test org for field validation');
      expect(found.isPersonal).toBe(false);
      expect(found.createdAt).toBeDefined();
      expect(found.updatedAt).toBeDefined();
    });

    it('returns 403 when USER role tries to list all organizations', async () => {
      const response = await request(app)
        .get(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('returns 401 without Authorization header', async () => {
      const response = await request(app)
        .get(`${BASE_PATH}/orgs`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  // =========================================================================
  // POST /orgs
  // =========================================================================
  describe('POST /orgs', () => {
    it('returns 201 and creates organization with valid data', async () => {
      const owner = await createAndLoginUser('USER');
      const name = `testorg_${randomSuffix()}`;

      const response = await request(app)
        .post(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          name,
          displayName: 'Test Organization',
          description: 'A test organization',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(name);
      expect(response.body.displayName).toBe('Test Organization');
      expect(response.body.description).toBe('A test organization');
      expect(response.body.isPersonal).toBe(false);
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();

      orgsToDelete.add(response.body.id);
    });

    it('returns 201 and creator is automatically set as OWNER', async () => {
      const owner = await createAndLoginUser('USER');

      const response = await request(app)
        .post(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          name: `ownercheck_${randomSuffix()}`,
          displayName: 'Owner Check Org',
        });

      expect(response.status).toBe(201);
      orgsToDelete.add(response.body.id);

      const membershipResponse = await request(app)
        .get(`${BASE_PATH}/orgs/${response.body.id}/members`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(membershipResponse.status).toBe(200);
      const ownerMembership = membershipResponse.body.find((m: any) => m.user?.id === owner.id);
      expect(ownerMembership).toBeDefined();
      expect(ownerMembership.role).toBe('OWNER');
    });

    it('returns 201 when creating personal organization with name auto-set to username', async () => {
      const user = await createTestUser('USER');
      const loginRes = await request(app)
        .post(`${BASE_PATH}/users/login`)
        .send({ loginField: user.username, password: 'password123' });
      const token = loginRes.body.token;

      // Login creates a personal org via ensurePersonalOrganizationForUser.
      // Verify it exists and has the correct properties.
      const listRes = await request(app)
        .get(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(listRes.status).toBe(200);
      const personalOrg = listRes.body.find((o: any) => o.name === user.username.toLowerCase() && o.isPersonal === true);
      expect(personalOrg).toBeDefined();
      expect(personalOrg.displayName).toContain('personal');
    });

    it('returns 201 when ADMIN creates organization for themselves', async () => {
      const name = `adminorg_${randomSuffix()}`;

      const response = await request(app)
        .post(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({
          name,
          displayName: 'Admin Created Org',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(name);

      orgsToDelete.add(response.body.id);
    });

    it('returns 201 with optional avatarUrl', async () => {
      const owner = await createAndLoginUser('USER');

      const response = await request(app)
        .post(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          name: `avatarorg_${randomSuffix()}`,
          displayName: 'Avatar Org',
          avatarUrl: 'https://example.com/avatar.png',
        });

      expect(response.status).toBe(201);
      expect(response.body.avatar).toBeDefined();

      orgsToDelete.add(response.body.id);
    });

    it('returns 422 when name is missing for non-personal organization', async () => {
      const owner = await createAndLoginUser('USER');

      const response = await request(app)
        .post(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          displayName: 'No Name Org',
        });

      expect(response.status).toBe(422);
    });

    it('returns 422 when displayName is missing', async () => {
      const owner = await createAndLoginUser('USER');

      const response = await request(app)
        .post(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          name: `nodisplay_${randomSuffix()}`,
        });

      expect(response.status).toBe(422);
    });

    it('returns 422 when name contains uppercase characters', async () => {
      const owner = await createAndLoginUser('USER');

      const response = await request(app)
        .post(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          name: 'InvalidUpperCase',
          displayName: 'Invalid Name Org',
        });

      expect(response.status).toBe(422);
    });

    it('returns 422 when name contains spaces', async () => {
      const owner = await createAndLoginUser('USER');

      const response = await request(app)
        .post(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          name: 'invalid name with spaces',
          displayName: 'Spaces In Name',
        });

      expect(response.status).toBe(422);
    });

    it('returns 422 when name is too short (less than 3 characters)', async () => {
      const owner = await createAndLoginUser('USER');

      const response = await request(app)
        .post(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          name: 'ab',
          displayName: 'Short Name Org',
        });

      expect(response.status).toBe(422);
    });

    it('returns 422 when name is too long (more than 50 characters)', async () => {
      const owner = await createAndLoginUser('USER');

      const response = await request(app)
        .post(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          name: 'a'.repeat(51),
          displayName: 'Long Name Org',
        });

      expect(response.status).toBe(422);
    });

    it('returns 422 when name is duplicate', async () => {
      const owner = await createAndLoginUser('USER');
      const name = `duplicate_${randomSuffix()}`;

      await createTestOrganization(owner.token, { name });

      const response = await request(app)
        .post(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          name,
          displayName: 'Duplicate Org',
        });

      expect(response.status).toBe(422);
      expect(response.body.error).toBeDefined();
    });

    it('returns 401 without Authorization header', async () => {
      const response = await request(app)
        .post(`${BASE_PATH}/orgs`)
        .send({
          name: `noauth_${randomSuffix()}`,
          displayName: 'No Auth Org',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  // =========================================================================
  // GET /orgs/:organizationId
  // =========================================================================
  describe('GET /orgs/:organizationId', () => {
    it('returns 200 and organization details when OWNER requests', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(org.id);
      expect(response.body.name).toBe(org.name);
      expect(response.body.displayName).toBe(org.displayName);
    });

    it('returns 200 when ADMIN (org role) requests', async () => {
      const owner = await createAndLoginUser('USER');
      const admin = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(admin.id, org.id, 'ADMIN');

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${admin.token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(org.id);
    });

    it('returns 200 when MEMBER (org role) requests', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${member.token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(org.id);
    });

    it('returns 200 when global ADMIN requests any organization', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(org.id);
    });

    it('returns organization with expected fields', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token, {
        displayName: 'Detail Org',
        description: 'An org for detail testing',
      });

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(org.id);
      expect(response.body.name).toBe(org.name);
      expect(response.body.displayName).toBe('Detail Org');
      expect(response.body.description).toBe('An org for detail testing');
      expect(response.body.isPersonal).toBe(false);
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('returns 403 when non-member USER requests', async () => {
      const owner = await createAndLoginUser('USER');
      const outsider = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${outsider.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('returns 404 when organization does not exist', async () => {
      const fakeId = '68050bd09890322c57842f6f';

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${fakeId}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('returns 401 without Authorization header', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  // =========================================================================
  // PUT /orgs/:organizationId
  // =========================================================================
  describe('PUT /orgs/:organizationId', () => {
    it('returns 200 when OWNER updates displayName', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ displayName: 'Updated Display Name' });

      expect(response.status).toBe(200);
      expect(response.body.displayName).toBe('Updated Display Name');
      expect(response.body.name).toBe(org.name);
    });

    it('returns 200 when OWNER updates description', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ description: 'New description' });

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('New description');
    });

    it('returns 200 when OWNER updates avatarUrl', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ avatarUrl: 'https://example.com/new-avatar.png' });

      expect(response.status).toBe(200);
    });

    it('returns 200 when ADMIN (org role) updates', async () => {
      const owner = await createAndLoginUser('USER');
      const orgAdmin = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(orgAdmin.id, org.id, 'ADMIN');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${orgAdmin.token}`)
        .send({ displayName: 'Admin Updated' });

      expect(response.status).toBe(200);
      expect(response.body.displayName).toBe('Admin Updated');
    });

    it('returns 200 when global ADMIN updates any organization', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ displayName: 'Global Admin Updated' });

      expect(response.status).toBe(200);
      expect(response.body.displayName).toBe('Global Admin Updated');
    });

    it('returns 200 and allows updating multiple fields at once', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          displayName: 'Multi Update',
          description: 'Updated description',
          avatarUrl: 'https://example.com/new-avatar.png',
        });

      expect(response.status).toBe(200);
      expect(response.body.displayName).toBe('Multi Update');
      expect(response.body.description).toBe('Updated description');
    });

    it('returns 403 when MEMBER (org role) tries to update', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${member.token}`)
        .send({ displayName: 'Member Update' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('returns 403 when non-member USER tries to update', async () => {
      const owner = await createAndLoginUser('USER');
      const outsider = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${outsider.token}`)
        .send({ displayName: 'Outsider Update' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('returns 404 when organization does not exist', async () => {
      const fakeId = '68050bd09890322c57842f6f';

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${fakeId}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ displayName: 'No Org' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('returns 401 without Authorization header', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}`)
        .send({ displayName: 'No Auth' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  // =========================================================================
  // DELETE /orgs/:organizationId
  // =========================================================================
  describe('DELETE /orgs/:organizationId', () => {
    it('returns 200 when OWNER deletes own organization', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Successfully deleted.');
      orgsToDelete.delete(org.id);
    });

    it('returns 200 when global ADMIN deletes any organization', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Successfully deleted.');
      orgsToDelete.delete(org.id);
    });

    it('returns 200 and cascades deletion of memberships', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(response.status).toBe(200);

      const membership = await OrganizationMembershipMongoose.findOne({
        _userId: member.id,
        _organizationId: org.id,
      });
      expect(membership).toBeNull();
      orgsToDelete.delete(org.id);
    });

    it('returns 403 when trying to delete a personal organization', async () => {
      // Login creates a personal org via ensurePersonalOrganizationForUser
      const user = await createTestUser('USER');
      const loginRes = await request(app)
        .post(`${BASE_PATH}/users/login`)
        .send({ loginField: user.username, password: 'password123' });
      const token = loginRes.body.token;

      // Find the personal org that was created during login
      const listRes = await request(app)
        .get(`${BASE_PATH}/orgs`)
        .set('Authorization', `Bearer ${adminUser.token}`);
      const personalOrg = listRes.body.find((o: any) => o.name === user.username.toLowerCase() && o.isPersonal === true);
      expect(personalOrg).toBeDefined();

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${personalOrg.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Personal');
    });

    it('returns 403 when MEMBER (org role) tries to delete', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${member.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('returns 403 when non-member USER tries to delete', async () => {
      const owner = await createAndLoginUser('USER');
      const outsider = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${org.id}`)
        .set('Authorization', `Bearer ${outsider.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('returns 404 when organization does not exist', async () => {
      const fakeId = '68050bd09890322c57842f6f';

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${fakeId}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('returns 401 without Authorization header', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${org.id}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  // =========================================================================
  // GET /orgs/:organizationId/members
  // =========================================================================
  describe('GET /orgs/:organizationId/members', () => {
    it('returns 200 and list of members when OWNER requests', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].role).toBe('OWNER');
      expect(response.body[0].user).toBeDefined();
      expect(response.body[0].user.id).toBe(owner.id);
    });

    it('returns 200 and includes all members with their roles', async () => {
      const owner = await createAndLoginUser('USER');
      const orgAdmin = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(orgAdmin.id, org.id, 'ADMIN');
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      const roles = response.body.map((m: any) => m.role);
      expect(roles).toContain('OWNER');
      expect(roles).toContain('ADMIN');
      expect(roles).toContain('MEMBER');
    });

    it('returns members with nested user data (id, username, email, avatar)', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(response.status).toBe(200);
      const memberEntry = response.body.find((m: any) => m.user?.id === member.id);
      expect(memberEntry).toBeDefined();
      expect(memberEntry.user.username).toBe(member.username);
      expect(memberEntry.user.email).toBe(member.email);
      expect(memberEntry.user.avatar).toBeDefined();
    });

    it('returns 200 when MEMBER (org role) requests', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${member.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('returns 200 when global ADMIN requests', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('returns 403 when non-member USER requests', async () => {
      const owner = await createAndLoginUser('USER');
      const outsider = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${outsider.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('returns 404 when organization does not exist', async () => {
      const fakeId = '68050bd09890322c57842f6f';

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${fakeId}/members`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('returns 401 without Authorization header', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}/members`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  // =========================================================================
  // POST /orgs/:organizationId/members
  // =========================================================================
  describe('POST /orgs/:organizationId/members', () => {
    it('returns 201 when OWNER adds a MEMBER', async () => {
      const owner = await createAndLoginUser('USER');
      const newMember = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .post(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ userId: newMember.id, role: 'MEMBER' });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('MEMBER');
      expect(response.body._userId).toBe(newMember.id);
      expect(response.body._organizationId).toBe(org.id);
    });

    it('returns 201 when OWNER adds an ADMIN', async () => {
      const owner = await createAndLoginUser('USER');
      const newAdmin = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .post(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ userId: newAdmin.id, role: 'ADMIN' });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('ADMIN');
    });

    it('returns 201 when OWNER adds another OWNER', async () => {
      const owner = await createAndLoginUser('USER');
      const newOwner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .post(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ userId: newOwner.id, role: 'OWNER' });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('OWNER');
    });

    it('returns 201 when org ADMIN adds a member', async () => {
      const owner = await createAndLoginUser('USER');
      const orgAdmin = await createAndLoginUser('USER');
      const newMember = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(orgAdmin.id, org.id, 'ADMIN');

      const response = await request(app)
        .post(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${orgAdmin.token}`)
        .send({ userId: newMember.id, role: 'MEMBER' });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('MEMBER');
    });

    it('returns 201 when global ADMIN adds a member', async () => {
      const owner = await createAndLoginUser('USER');
      const newMember = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .post(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ userId: newMember.id, role: 'MEMBER' });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe('MEMBER');
    });

    it('returns 422 when user is already a member', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .post(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ userId: member.id, role: 'MEMBER' });

      expect(response.status).toBe(422);
      expect(response.body.error).toBeDefined();
    });

    it('returns 422 when role is invalid', async () => {
      const owner = await createAndLoginUser('USER');
      const newMember = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .post(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ userId: newMember.id, role: 'INVALID_ROLE' });

      expect(response.status).toBe(422);
    });

    it('returns 422 when userId is missing', async () => {
      const owner = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .post(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ role: 'MEMBER' });

      expect(response.status).toBe(422);
    });

    it('returns 422 when role is missing', async () => {
      const owner = await createAndLoginUser('USER');
      const newMember = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .post(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ userId: newMember.id });

      expect(response.status).toBe(422);
    });

    it('returns 403 when org MEMBER tries to add a member', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const newGuy = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .post(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${member.token}`)
        .send({ userId: newGuy.id, role: 'MEMBER' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('returns 403 when non-member USER tries to add a member', async () => {
      const owner = await createAndLoginUser('USER');
      const outsider = await createAndLoginUser('USER');
      const newGuy = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .post(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${outsider.token}`)
        .send({ userId: newGuy.id, role: 'MEMBER' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('returns 404 when organization does not exist', async () => {
      const fakeId = '68050bd09890322c57842f6f';
      const newMember = await createAndLoginUser('USER');

      const response = await request(app)
        .post(`${BASE_PATH}/orgs/${fakeId}/members`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ userId: newMember.id, role: 'MEMBER' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('returns 401 without Authorization header', async () => {
      const owner = await createAndLoginUser('USER');
      const newMember = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .post(`${BASE_PATH}/orgs/${org.id}/members`)
        .send({ userId: newMember.id, role: 'MEMBER' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  // =========================================================================
  // PUT /orgs/:organizationId/members/:userId
  // =========================================================================
  describe('PUT /orgs/:organizationId/members/:userId', () => {
    it('returns 200 when OWNER promotes MEMBER to ADMIN', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ role: 'ADMIN' });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('ADMIN');
    });

    it('returns 200 when OWNER demotes ADMIN to MEMBER', async () => {
      const owner = await createAndLoginUser('USER');
      const orgAdmin = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(orgAdmin.id, org.id, 'ADMIN');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}/members/${orgAdmin.id}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ role: 'MEMBER' });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('MEMBER');
    });

    it('returns 200 when OWNER assigns OWNER role', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ role: 'OWNER' });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('OWNER');
    });

    it('returns 200 when org ADMIN updates member role', async () => {
      const owner = await createAndLoginUser('USER');
      const orgAdmin = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(orgAdmin.id, org.id, 'ADMIN');
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${orgAdmin.token}`)
        .send({ role: 'ADMIN' });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('ADMIN');
    });

    it('returns 200 when global ADMIN updates member role', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ role: 'ADMIN' });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('ADMIN');
    });
    
    it('returns 200 when global ADMIN tries to set OWNER role', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ role: 'OWNER' });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('OWNER');
    });

    it('returns 403 when org ADMIN updates member role to OWNER', async () => {
      const owner = await createAndLoginUser('USER');
      const orgAdmin = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(orgAdmin.id, org.id, 'ADMIN');
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${orgAdmin.token}`)
        .send({ role: 'OWNER' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('returns 403 when org MEMBER tries to update role', async () => {
      const owner = await createAndLoginUser('USER');
      const member1 = await createAndLoginUser('USER');
      const member2 = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member1.id, org.id, 'MEMBER');
      await createMembership(member2.id, org.id, 'MEMBER');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}/members/${member2.id}`)
        .set('Authorization', `Bearer ${member1.token}`)
        .send({ role: 'ADMIN' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('returns 403 when non-member USER tries to update role', async () => {
      const owner = await createAndLoginUser('USER');
      const outsider = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${outsider.token}`)
        .send({ role: 'ADMIN' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('returns 404 when membership does not exist', async () => {
      const owner = await createAndLoginUser('USER');
      const nonMember = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}/members/${nonMember.id}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ role: 'MEMBER' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('returns 404 when organization does not exist', async () => {
      const fakeId = '68050bd09890322c57842f6f';
      const member = await createAndLoginUser('USER');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${fakeId}/members/${member.id}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ role: 'MEMBER' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('returns 422 when role is invalid', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ role: 'SUPERUSER' });

      expect(response.status).toBe(422);
    });

    it('returns 422 when role is missing', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({});

      expect(response.status).toBe(422);
    });

    it('returns 401 without Authorization header', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .put(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .send({ role: 'ADMIN' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  // =========================================================================
  // DELETE /orgs/:organizationId/members/:userId
  // =========================================================================
  describe('DELETE /orgs/:organizationId/members/:userId', () => {
    it('returns 200 when OWNER removes a MEMBER', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Successfully removed.');

      const membership = await OrganizationMembershipMongoose.findOne({
        _userId: member.id,
        _organizationId: org.id,
      });
      expect(membership).toBeNull();
    });

    it('returns 200 when org ADMIN removes a member', async () => {
      const owner = await createAndLoginUser('USER');
      const orgAdmin = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(orgAdmin.id, org.id, 'ADMIN');
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${orgAdmin.token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Successfully removed.');
    });

    it('returns 200 when global ADMIN removes a member', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Successfully removed.');
    });

    it('returns 200 and removes the membership record from the database', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      await request(app)
        .delete(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${owner.token}`);

      const membersResponse = await request(app)
        .get(`${BASE_PATH}/orgs/${org.id}/members`)
        .set('Authorization', `Bearer ${owner.token}`);

      const userIds = membersResponse.body.map((m: any) => m.user?.id);
      expect(userIds).not.toContain(member.id);
    });

    it('returns 403 when org MEMBER tries to remove another member', async () => {
      const owner = await createAndLoginUser('USER');
      const member1 = await createAndLoginUser('USER');
      const member2 = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member1.id, org.id, 'MEMBER');
      await createMembership(member2.id, org.id, 'MEMBER');

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${org.id}/members/${member2.id}`)
        .set('Authorization', `Bearer ${member1.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('returns 403 when non-member USER tries to remove a member', async () => {
      const owner = await createAndLoginUser('USER');
      const outsider = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`)
        .set('Authorization', `Bearer ${outsider.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('returns 404 when membership does not exist', async () => {
      const owner = await createAndLoginUser('USER');
      const nonMember = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${org.id}/members/${nonMember.id}`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('returns 404 when organization does not exist', async () => {
      const fakeId = '68050bd09890322c57842f6f';
      const member = await createAndLoginUser('USER');

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${fakeId}/members/${member.id}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('returns 401 without Authorization header', async () => {
      const owner = await createAndLoginUser('USER');
      const member = await createAndLoginUser('USER');
      const org = await createTestOrganization(owner.token);
      await createMembership(member.id, org.id, 'MEMBER');

      const response = await request(app)
        .delete(`${BASE_PATH}/orgs/${org.id}/members/${member.id}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });
});
