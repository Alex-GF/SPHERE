import dotenv from 'dotenv';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { shutdownApp, TestApp } from './utils/testApp';
import { createTestUser, createAndLoginUser, deleteTestUser } from './utils/users/userTestUtils';
import {
  createTestOrganizationDirect,
  createMembership,
} from './utils/organizations/organizationTestUtils';
import { LeanUser } from '../main/types/models/User';
import { BASE_PATH, TEST_PASSWORD } from './utils/config/variables';
import testContainer from './utils/config/testContainer';
import OrganizationMongoose from '../main/repositories/mongoose/models/OrganizationMongoose';
import OrganizationMembershipMongoose from '../main/repositories/mongoose/models/OrganizationMembershipMongoose';
import UserMongoose from '../main/repositories/mongoose/models/UserMongoose';

dotenv.config();

describe('Users API integration', () => {
  let app: TestApp;
  const adminUser: LeanUser = testContainer.resolve('adminUser');
  const testUser: LeanUser = testContainer.resolve('testUser');
  const usersToDelete: Set<string> = testContainer.resolve('usersToDelete');

  beforeAll(async () => {
    app = testContainer.resolve('app');
  });

  afterEach(async () => {
    for (const username of usersToDelete) {
      await deleteTestUser(username);
    }
    usersToDelete.clear();
  });

  afterAll(async () => {
    await shutdownApp();
  });

  describe('GET /api/users', () => {
    it('Return 200 and array of users with ADMIN role.', async () => {
      const { user: newUser1 } = await createTestUser('USER');
      const { user: newUser2 } = await createTestUser('USER');

      const response = await request(app)
        .get(`${BASE_PATH}/users`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      const usernames = response.body.map((u: any) => u.username);
      expect(usernames).toContain(adminUser.username);
      expect(usernames).toContain(newUser1.username);
      expect(usernames).toContain(newUser2.username);
    });

    it('Return 200 and array of users with ADMIN role and username filter.', async () => {
      const { user: newUser1 } = await createTestUser('USER');
      await createTestUser('USER');

      const response = await request(app)
        .get(`${BASE_PATH}/users?username=${newUser1.username.substring(10, 15)}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThan(3);
    });

    it('Return 200 and array of users with ADMIN role and email filter.', async () => {
      const { user: newUser1 } = await createTestUser('USER');
      await createTestUser('USER');

      const response = await request(app)
        .get(`${BASE_PATH}/users?email=${newUser1.email.substring(10, 15)}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThan(3);
    });

    it('Return 200 with q search for USER role when q has 4+ characters.', async () => {
      const suffix = `alice_${Date.now()}`;
      await createTestUser('USER', suffix);
      await createTestUser('USER');

      const response = await request(app)
        .get(`${BASE_PATH}/users?q=alice`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      const usernames = response.body.map((u: any) => u.username);
      expect(usernames).toContain(suffix);
    });

    it('Return 403 with q search for USER role when q has less than 4 characters.', async () => {
      const response = await request(app)
        .get(`${BASE_PATH}/users?q=ali`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('Return 403 for USER role without q parameter.', async () => {
      const response = await request(app)
        .get(`${BASE_PATH}/users`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(403);
    });

    it('Return 200 with q search matching firstName for USER role.', async () => {
      const suffix = `searchuser_${Date.now()}`;
      const userData = {
        username: suffix,
        password: TEST_PASSWORD,
        role: 'USER',
        firstName: 'SpecialFirstName',
        lastName: 'SpecialLastName',
        email: `${suffix}@example.com`,
      };
      const user = new UserMongoose(userData);
      await user.save();
      testContainer.resolve('usersToDelete').add(suffix);

      const response = await request(app)
        .get(`${BASE_PATH}/users?q=SpecialFirst`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      const usernames = response.body.map((u: any) => u.username);
      expect(usernames).toContain(suffix);
    });

    it('Return 200 with q search excluding sensitive fields for USER role.', async () => {
      const suffix = `privacy_${Date.now()}`;
      await createTestUser('USER', suffix);

      const response = await request(app)
        .get(`${BASE_PATH}/users?q=${suffix}`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      const user = response.body.find((u: any) => u.username === suffix);
      expect(user).toBeDefined();
      expect(user.email).toBeUndefined();
      expect(user.role).toBeUndefined();
      expect(user.phone).toBeUndefined();
      expect(user.token).toBeUndefined();
    });

    it('Return 200 with q search including sensitive fields for ADMIN role.', async () => {
      const suffix = `adminsearch_${Date.now()}`;
      await createTestUser('USER', suffix);

      const response = await request(app)
        .get(`${BASE_PATH}/users?q=${suffix}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      const user = response.body.find((u: any) => u.username === suffix);
      expect(user).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.role).toBeDefined();
    });
  });

  describe('GET /api/users/me', () => {
    it('Return 200 and user object with valid Bearer Authorization header.', async () => {
      const { user } = await createTestUser('USER');

      const response = await request(app)
        .get(`${BASE_PATH}/users/me`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe(user.username);
      expect(response.body.email).toBe(user.email);
      expect(response.body.role).toBe(user.role);
    });

    it('Return 401 with structurally valid token not linked to user', async () => {
      const { user } = await createTestUser('USER');

      const response = await request(app)
        .get(`${BASE_PATH}/users/me`)
        .set('Authorization', `Bearer ${user.token}invalid`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /api/users/register', () => {
    const randomSuffix = () => Math.random().toString(36).substring(2, 8);

    const buildRegisterPayload = (overrides: Record<string, any> = {}) => {
      const suffix = randomSuffix();

      return {
        firstName: 'John',
        lastName: 'Doe',
        email: `john.${suffix}@example.com`,
        username: `john_doe_${suffix}`,
        password: TEST_PASSWORD,
        phone: `+34-600-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        role: 'USER',
        ...overrides,
      };
    };

    it('Return 201 and user object with valid required fields.', async () => {
      const payload = buildRegisterPayload();

      const response = await request(app).post(`${BASE_PATH}/users/register`).send(payload);

      expect(response.status).toBe(201);
      expect(response.body.username).toBe(payload.username);
      expect(response.body.email).toBe(payload.email);
      expect(response.body.role).toBe('USER');
      expect(typeof response.body.password).toBe('string');

      usersToDelete.add(payload.username);
    });

    it('Return 201 and user object with omitted role parameter.', async () => {
      const payload: any = buildRegisterPayload();
      delete payload.role;

      const response = await request(app).post(`${BASE_PATH}/users/register`).send(payload);

      expect(response.status).toBe(201);
      expect(response.body.username).toBe(payload.username);
      expect(response.body.role).toBe('USER');

      usersToDelete.add(payload.username);
    });

    it('Return 403 if USER tries to create an ADMIN', async () => {
      const payload = buildRegisterPayload({ role: 'ADMIN' });

      const response = await request(app)
        .post(`${BASE_PATH}/users/register`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(payload);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('Return 422 and validation errors object with missing required parameters.', async () => {
      const response = await request(app).post(`${BASE_PATH}/users/register`).send({
        firstName: 'A',
        lastName: 'B',
      });

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Return 422 and validation errors object with invalid email parameter.', async () => {
      const payload = buildRegisterPayload({ email: 'invalid-email-format' });

      const response = await request(app).post(`${BASE_PATH}/users/register`).send(payload);

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Return 422 and validation errors object with password parameter containing spaces.', async () => {
      const payload = buildRegisterPayload({ password: 'abc def' });

      const response = await request(app).post(`${BASE_PATH}/users/register`).send(payload);

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Return 422 and error object with duplicated username parameter.', async () => {
      const payload = buildRegisterPayload();

      const firstResponse = await request(app).post(`${BASE_PATH}/users/register`).send(payload);
      expect(firstResponse.status).toBe(201);

      usersToDelete.add(payload.username);

      const duplicatePayload = buildRegisterPayload({
        username: payload.username,
        email: `duplicate.${randomSuffix()}@example.com`,
      });
      const duplicateResponse = await request(app)
        .post(`${BASE_PATH}/users/register`)
        .send(duplicatePayload);

      expect(duplicateResponse.status).toBe(422);
      expect(duplicateResponse.body.error).toContain('username');
    });
  });

  describe('POST /api/users/login', () => {
    it('Return 200 and token object with email as loginField parameter.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const loginByEmail = await request(app).post(`${BASE_PATH}/users/login`).send({
        loginField: user.email,
        password: TEST_PASSWORD,
      });

      expect(loginByEmail.status).toBe(200);
      expect(loginByEmail.body.token).toBeDefined();
    });

    it('Return 200 and token object with username as loginField parameter.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const loginByUsername = await request(app).post(`${BASE_PATH}/users/login`).send({
        loginField: user.username,
        password: TEST_PASSWORD,
      });

      expect(loginByUsername.status).toBe(200);
      expect(loginByUsername.body.token).toBeDefined();
    });

    it('Return 401 and error object with wrong password parameter.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app).post(`${BASE_PATH}/users/login`).send({
        loginField: user.username,
        password: 'wrong-password',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('Return 401 and error object with unknown loginField parameter.', async () => {
      const response = await request(app).post(`${BASE_PATH}/users/login`).send({
        loginField: 'invalid@sphere.test',
        password: 'invalid-password',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 422 and validation errors object with invalid loginField format parameter.', async () => {
      const response = await request(app).post(`${BASE_PATH}/users/login`).send({
        loginField: 'not-valid-login-field@@',
        password: 'some-password',
      });

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Return 422 and validation errors object with missing password parameter.', async () => {
      const response = await request(app).post(`${BASE_PATH}/users/login`).send({
        loginField: 'validUser',
      });

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Return 422 and validation errors object with non-string loginField parameter.', async () => {
      const response = await request(app).post(`${BASE_PATH}/users/login`).send({
        loginField: 12345,
        password: TEST_PASSWORD,
      });

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('GET /api/users/:username', () => {
    it('Return 200 and full user object with owner requesting own username parameter.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .get(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe(user.username);
      expect(response.body.role).toBeDefined();
      expect(response.body.email).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.password).toBeUndefined();
    });

    it('Return 200 and public user object with regular user requesting another username parameter.', async () => {
      const { user } = await createTestUser('USER');
      const { user: otherUser } = await createTestUser('USER');
      usersToDelete.add(otherUser.username);

      const response = await request(app)
        .get(`${BASE_PATH}/users/${otherUser.username}`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe(otherUser.username);
      expect(response.body.role).toBeUndefined();
      expect(response.body.email).toBeUndefined();
      expect(response.body.password).toBeUndefined();
      expect(response.body.token).toBeUndefined();
    });

    it('Return 200 and full user object with admin requesting another username parameter.', async () => {
      const { user: targetUser } = await createTestUser('USER');

      const response = await request(app)
        .get(`${BASE_PATH}/users/${targetUser.username}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe(targetUser.username);
      expect(response.body.role).toBeDefined();
      expect(response.body.email).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.password).toBeUndefined();
    });

    it('Return 401 and error object with missing Authorization header.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app).get(`${BASE_PATH}/users/${user.username}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with malformed Authorization header.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .get(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', 'Token malformed');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 404 and not found object with non-existing username parameter.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .get(`${BASE_PATH}/users/nonexistent_user`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:username', () => {
    it('Return 200 and updated user object with owner editing own profile parameters.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const payload = {
        firstName: 'UpdatedName',
        lastName: 'UpdatedLastName',
        email: 'updated@example.com',
      };

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe(payload.firstName);
      expect(response.body.lastName).toBe(payload.lastName);
      expect(response.body.email).toBe(payload.email);
    });

    it('Return 200 and updated user object with owner changing password parameter.', async () => {
      const { user } = await createTestUser('USER');
      const updatedPassword = 'newPassword123';

      const updateResponse = await request(app)
        .put(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ password: updatedPassword });

      expect(updateResponse.status).toBe(200);

      const oldPasswordLogin = await request(app).post(`${BASE_PATH}/users/login`).send({
        loginField: user.username,
        password: TEST_PASSWORD,
      });
      expect(oldPasswordLogin.status).toBe(401);

      const newPasswordLogin = await request(app).post(`${BASE_PATH}/users/login`).send({
        loginField: user.username,
        password: updatedPassword,
      });
      expect(newPasswordLogin.status).toBe(200);
      expect(newPasswordLogin.body.token).toBeDefined();
    });

    it('Return 200 and updated user object with admin changing another user role parameter.', async () => {
      const { user: targetUser } = await createTestUser('USER');

      const response = await request(app)
        .put(`${BASE_PATH}/users/${targetUser.username}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ role: 'ADMIN' });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('ADMIN');
    });

    it('Return 403 and error object with regular user updating another username parameter.', async () => {
      const { user } = await createTestUser('USER');
      const { user: otherUser } = await createTestUser('USER');
      usersToDelete.add(user.username);
      usersToDelete.add(otherUser.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${otherUser.username}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ firstName: 'UnauthorizedChange' });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('only update your own');
    });

    it('Return 403 and error object with regular user changing own role parameter.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ role: 'ADMIN' });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('only update user roles');
    });

    it('Return 422 and validation errors object with invalid email parameter.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Return 422 and error object with duplicated username parameter.', async () => {
      const { user } = await createTestUser('USER');
      const { user: existingUser } = await createTestUser('USER');
      usersToDelete.add(existingUser.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ username: existingUser.username });

      expect(response.status).toBe(422);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with missing Authorization header.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}`)
        .send({ firstName: 'NoAuth' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 404 and not found object with non-existing username parameter.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/nonexistent_user`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ firstName: 'Ghost' });

      expect(response.status).toBe(404);
    });

    it('Renames personal organization name when username is changed.', async () => {
      const { user } = await createAndLoginUser('USER');
      const newUsername = `renamed_user_${Date.now()}`;

      const personalOrgBefore = await OrganizationMongoose.findOne({
        name: user.username.toLowerCase(),
        isPersonal: true,
      });
      expect(personalOrgBefore).not.toBeNull();

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ username: newUsername });

      expect(response.status).toBe(200);
      expect(response.body.username).toBe(newUsername);

      const personalOrgAfter = await OrganizationMongoose.findOne({
        name: newUsername.toLowerCase(),
        isPersonal: true,
      });
      expect(personalOrgAfter).not.toBeNull();
      expect(personalOrgAfter!.displayName).toBe(`${newUsername} (personal)`);

      const oldOrg = await OrganizationMongoose.findOne({
        name: user.username.toLowerCase(),
        isPersonal: true,
      });
      expect(oldOrg).toBeNull();

      await UserMongoose.deleteOne({ username: newUsername });
    });

    it('Does not rename personal organization when username is not changed.', async () => {
      const { user } = await createAndLoginUser('USER');

      const personalOrgBefore = await OrganizationMongoose.findOne({
        name: user.username.toLowerCase(),
        isPersonal: true,
      });
      expect(personalOrgBefore).not.toBeNull();

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ firstName: 'UpdatedOnly' });

      expect(response.status).toBe(200);

      const personalOrgAfter = await OrganizationMongoose.findOne({
        name: user.username.toLowerCase(),
        isPersonal: true,
      });
      expect(personalOrgAfter).not.toBeNull();
      expect(personalOrgAfter!.name).toBe(user.username.toLowerCase());
      expect(personalOrgAfter!.displayName).toBe(`${user.username} (Personal)`);
    });

    it('Admin renaming another user also renames their personal organization.', async () => {
      const { user: targetUser } = await createTestUser('USER');
      const newUsername = `admin_renamed_${Date.now()}`;

      const response = await request(app)
        .put(`${BASE_PATH}/users/${targetUser.username}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ username: newUsername });

      expect(response.status).toBe(200);
      expect(response.body.username).toBe(newUsername);

      const personalOrgAfter = await OrganizationMongoose.findOne({
        name: newUsername.toLowerCase(),
        isPersonal: true,
      });
      expect(personalOrgAfter).not.toBeNull();
      expect(personalOrgAfter!.displayName).toBe(`${newUsername} (personal)`);

      await UserMongoose.deleteOne({ username: newUsername });
    });
  });

  describe('PUT /api/users/:username/refresh-token', () => {
    it('Return 200 and token object with valid Bearer Authorization header.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}/refresh-token`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.tokenExpiration).toBeDefined();
    });

    it('Return 401 and error object with missing Authorization header.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app).put(`${BASE_PATH}/users/${user.username}/refresh-token`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with malformed Authorization header.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}/refresh-token`)
        .set('Authorization', 'Token abc123');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with invalid Bearer token parameter.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}/refresh-token`)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it("Return 403 with USER role attempting to update user's token.", async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}/refresh-token`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('Return 200 and a new working token after refresh.', async () => {
      const { user: testAdminUser } = await createTestUser('ADMIN');

      const refreshResponse = await request(app)
        .put(`${BASE_PATH}/users/${testAdminUser.username}/refresh-token`)
        .set('Authorization', `Bearer ${testAdminUser.token}`);
      expect(refreshResponse.status).toBe(200);

      const newTokenResponse = await request(app)
        .put(`${BASE_PATH}/users/${testAdminUser.username}/refresh-token`)
        .set('Authorization', `Bearer ${refreshResponse.body.token}`);
      expect(newTokenResponse.status).toBe(200);
      expect(newTokenResponse.body.token).toBeDefined();
    });
  });

  describe('DELETE /api/users/:username', () => {
    it('Return 200 and success message object with owner deleting own username parameter.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .delete(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Successfully deleted.');
    });

    it('Return 200 and success message object with admin deleting another username parameter.', async () => {
      const { user: targetUser } = await createTestUser('USER');

      const response = await request(app)
        .delete(`${BASE_PATH}/users/${targetUser.username}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Successfully deleted.');
    });

    it('Return 403 and error object with regular user deleting another username parameter.', async () => {
      const { user } = await createTestUser('USER');
      const { user: otherUser } = await createTestUser('USER');
      usersToDelete.add(user.username);
      usersToDelete.add(otherUser.username);

      const response = await request(app)
        .delete(`${BASE_PATH}/users/${otherUser.username}`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with missing Authorization header.', async () => {
      const { user } = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app).delete(`${BASE_PATH}/users/${user.username}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 404 and not found object with non-existing username parameter.', async () => {
      const response = await request(app)
        .delete(`${BASE_PATH}/users/nonexistent_user}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(404);
    });

    it('Return 403 when trying to delete last admin user', async () => {
      const allAdminsResponse = await request(app)
        .get(`${BASE_PATH}/users`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      const admins = allAdminsResponse.body.filter((u: any) => u.role === 'ADMIN');

      if (admins.length > 1) {
        for (const admin of admins) {
          if (admin.username !== adminUser.username) {
            await request(app)
              .delete(`${BASE_PATH}/users/${admin.username}`)
              .set('Authorization', `Bearer ${adminUser.token}`);
          }
        }
      }

      const response = await request(app)
        .delete(`${BASE_PATH}/users/${adminUser.username}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error.toLowerCase()).toContain('at least one');
    });

    it('Removes user membership from non-personal org without deleting it when other members exist', async () => {
      const { user: userToDelete } = await createTestUser('USER');
      const { user: otherMember } = await createTestUser('USER');
      usersToDelete.add(userToDelete.username);
      usersToDelete.add(otherMember.username);

      const org = await createTestOrganizationDirect({
        name: `test_org_${Date.now()}`,
        displayName: 'Test Org',
        isPersonal: false,
      });
      testContainer.resolve('orgsToDelete').add(org.id);

      await createMembership(userToDelete.id, org.id, 'MEMBER');
      await createMembership(otherMember.id, org.id, 'MEMBER');

      const response = await request(app)
        .delete(`${BASE_PATH}/users/${userToDelete.username}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);

      const orgAfter = await OrganizationMongoose.findById(org.id);
      expect(orgAfter).not.toBeNull();

      const membershipAfter = await OrganizationMembershipMongoose.findOne({
        _userId: userToDelete.id,
        _organizationId: org.id,
      });
      expect(membershipAfter).toBeNull();
    });

    it('Transfers OWNER role to ADMIN when deleting owner from org with ADMIN member', async () => {
      const { user: userToDelete } = await createTestUser('USER');
      const { user: adminMember } = await createTestUser('USER');
      usersToDelete.add(userToDelete.username);
      usersToDelete.add(adminMember.username);

      const org = await createTestOrganizationDirect({
        name: `test_org_${Date.now()}`,
        displayName: 'Test Org',
        isPersonal: false,
      });
      testContainer.resolve('orgsToDelete').add(org.id);

      await createMembership(userToDelete.id, org.id, 'OWNER');
      await createMembership(adminMember.id, org.id, 'ADMIN');

      const response = await request(app)
        .delete(`${BASE_PATH}/users/${userToDelete.username}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);

      const remainingMembership = await OrganizationMembershipMongoose.findOne({
        _userId: adminMember.id,
        _organizationId: org.id,
      });
      expect(remainingMembership).not.toBeNull();
      expect(remainingMembership?.role).toBe('OWNER');
    });

    it('Transfers OWNER role to MEMBER when deleting owner from org with no ADMIN', async () => {
      const { user: userToDelete } = await createTestUser('USER');
      const { user: memberUser } = await createTestUser('USER');
      usersToDelete.add(userToDelete.username);
      usersToDelete.add(memberUser.username);

      const org = await createTestOrganizationDirect({
        name: `test_org_${Date.now()}`,
        displayName: 'Test Org',
        isPersonal: false,
      });
      testContainer.resolve('orgsToDelete').add(org.id);

      await createMembership(userToDelete.id, org.id, 'OWNER');
      await createMembership(memberUser.id, org.id, 'MEMBER');

      const response = await request(app)
        .delete(`${BASE_PATH}/users/${userToDelete.username}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);

      const remainingMembership = await OrganizationMembershipMongoose.findOne({
        _userId: memberUser.id,
        _organizationId: org.id,
      });
      expect(remainingMembership).not.toBeNull();
      expect(remainingMembership?.role).toBe('OWNER');
    });

it('Deletes organization when it becomes empty after user deletion (non-personal)', async () => {
      const { user: userToDelete } = await createTestUser('USER');
      usersToDelete.add(userToDelete.username);

      const org = await createTestOrganizationDirect({
        name: `test_org_${Date.now()}`,
        displayName: 'Test Org',
        isPersonal: false,
      });

      await createMembership(userToDelete.id, org.id, 'MEMBER');

      const response = await request(app)
        .delete(`${BASE_PATH}/users/${userToDelete.username}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);

      const orgAfter = await OrganizationMongoose.findById(org.id);
      expect(orgAfter).toBeNull();
    });

    it('Deletes personal organization even when it has other members (edge case)', async () => {
      const registerPayload = {
        firstName: 'John',
        lastName: 'Doe',
        email: `john_edge_${Date.now()}@example.com`,
        username: `john_edge_${Date.now()}`,
        password: TEST_PASSWORD,
        phone: '+34-600-0002',
        role: 'USER',
      };

      const registerResponse = await request(app)
        .post(`${BASE_PATH}/users/register`)
        .send(registerPayload);
      expect(registerResponse.status).toBe(201);
      usersToDelete.add(registerResponse.body.username);

      const loginResponse = await request(app)
        .post(`${BASE_PATH}/users/login`)
        .send({
          loginField: registerPayload.username,
          password: TEST_PASSWORD,
        });
      expect(loginResponse.status).toBe(200);

      const personalOrg = await OrganizationMongoose.findOne({ name: registerPayload.username.toLowerCase(), isPersonal: true });
      expect(personalOrg).not.toBeNull();

      const { user: otherMember } = await createTestUser('USER');
      usersToDelete.add(otherMember.username);
      await createMembership(otherMember.id, personalOrg!.id, 'MEMBER');

      const response = await request(app)
        .delete(`${BASE_PATH}/users/${registerPayload.username}`)
        .set('Authorization', `Bearer ${loginResponse.body.token}`);

      expect(response.status).toBe(200);

      const deletedOrg = await OrganizationMongoose.findById(personalOrg!._id);
      expect(deletedOrg).toBeNull();
    });
  });

  // ============================================
  // User Settings
  // ============================================
  describe('GET /api/v1/users/me/settings', () => {
    it('Return 200 and own settings for an authenticated USER.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_getter');
      const response = await request(app)
        .get(`${BASE_PATH}/users/me/settings`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', user.username);
      expect(response.body).toHaveProperty('email', user.email);
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('token');
      expect(response.body).not.toHaveProperty('tokenExpiration');
    });

    it('Return 200 and own settings for an authenticated ADMIN.', async () => {
      const response = await request(app)
        .get(`${BASE_PATH}/users/me/settings`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', adminUser.username);
      expect(response.body).toHaveProperty('role', 'ADMIN');
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('token');
    });

    it('Return 401 without authorization header.', async () => {
      const response = await request(app)
        .get(`${BASE_PATH}/users/me/settings`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/users/me/settings', () => {
    it('Return 200 and updated email.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_updater');
      const newEmail = `updated_${Date.now()}@test.com`;
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ email: newEmail });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', newEmail);
    });

    it('Return 200 and updated firstName and lastName.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_name');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ firstName: 'Jane', lastName: 'Smith' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('firstName', 'Jane');
      expect(response.body).toHaveProperty('lastName', 'Smith');
    });

    it('Return 200 and updated phone in settings.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_phone');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ phone: '+1234567890' });

      expect(response.status).toBe(200);
      expect(response.body.settings).toHaveProperty('phone', '+1234567890');
    });

    it('Return 422 when email is already in use.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_dup_email');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ email: adminUser.email });

      expect(response.status).toBe(422);
      expect(response.body.error).toMatch(/email/i);
    });

    it('Return 401 without authorization header.', async () => {
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings`)
        .send({ firstName: 'Unauthorized' });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/users/me/settings/profile', () => {
    it('Return 200 and updated profile fields.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_profile');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/profile`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          displayName: 'Test Display Name',
          bio: 'This is a test bio.',
          city: 'Buenos Aires',
          country: 'Argentina',
          dateOfBirth: '1990-05-15',
        });

      expect(response.status).toBe(200);
      expect(response.body.settings?.profile).toHaveProperty('displayName', 'Test Display Name');
      expect(response.body.settings?.profile).toHaveProperty('bio', 'This is a test bio.');
      expect(response.body.settings?.profile).toHaveProperty('city', 'Buenos Aires');
      expect(response.body.settings?.profile).toHaveProperty('country', 'Argentina');
      expect(response.body.settings?.profile).toHaveProperty('dateOfBirth', '1990-05-15');
    });

    it('Return 200 and update only provided profile fields.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_profile2');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/profile`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ bio: 'Updated bio only.' });

      expect(response.status).toBe(200);
      expect(response.body.settings?.profile).toHaveProperty('bio', 'Updated bio only.');
    });

    it('Return 401 without authorization header.', async () => {
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/profile`)
        .send({ displayName: 'No Auth' });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/users/me/settings/social-links', () => {
    it('Return 200 and update social links with valid URLs.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_social');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/social-links`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          linkedin: 'https://www.linkedin.com/in/johndoe',
          instagram: 'https://www.instagram.com/johndoe',
          facebook: 'https://www.facebook.com/johndoe',
          x: 'https://x.com/johndoe',
        });

      expect(response.status).toBe(200);
      expect(response.body.settings?.socialLinks).toHaveProperty('linkedin', 'https://www.linkedin.com/in/johndoe');
      expect(response.body.settings?.socialLinks).toHaveProperty('instagram', 'https://www.instagram.com/johndoe');
      expect(response.body.settings?.socialLinks).toHaveProperty('facebook', 'https://www.facebook.com/johndoe');
      expect(response.body.settings?.socialLinks).toHaveProperty('x', 'https://x.com/johndoe');
    });

    it('Return 200 and update only provided social links.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_social2');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/social-links`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ linkedin: 'https://www.linkedin.com/in/janedoe' });

      expect(response.status).toBe(200);
      expect(response.body.settings?.socialLinks).toHaveProperty('linkedin', 'https://www.linkedin.com/in/janedoe');
    });

    it('Return 422 for invalid LinkedIn URL.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_social_li');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/social-links`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ linkedin: 'https://www.notlinkedin.com/profile' });

      expect(response.status).toBe(422);
      expect(response.body.error).toMatch(/linkedin/i);
    });

    it('Return 422 for invalid Instagram URL.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_social_ig');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/social-links`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ instagram: 'https://www.notinstagram.com/johndoe' });

      expect(response.status).toBe(422);
      expect(response.body.error).toMatch(/instagram/i);
    });

    it('Return 422 for invalid Facebook URL.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_social_fb');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/social-links`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ facebook: 'https://www.notfacebook.com/johndoe' });

      expect(response.status).toBe(422);
      expect(response.body.error).toMatch(/facebook/i);
    });

    it('Return 422 for invalid X/Twitter URL.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_social_x');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/social-links`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ x: 'https://www.notx.com/johndoe' });

      expect(response.status).toBe(422);
      expect(response.body.error).toMatch(/x/i);
    });

    it('Return 200 with valid LinkedIn company URL.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_social_li2');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/social-links`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ linkedin: 'https://www.linkedin.com/company/acme-corp' });

      expect(response.status).toBe(200);
      expect(response.body.settings?.socialLinks).toHaveProperty('linkedin', 'https://www.linkedin.com/company/acme-corp');
    });

    it('Return 200 with valid Twitter URL format.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_social_tw');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/social-links`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ x: 'https://twitter.com/johndoe' });

      expect(response.status).toBe(200);
      expect(response.body.settings?.socialLinks).toHaveProperty('x', 'https://twitter.com/johndoe');
    });

    it('Return 401 without authorization header.', async () => {
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/social-links`)
        .send({ linkedin: 'https://www.linkedin.com/in/nobody' });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/users/me/settings/notifications', () => {
    it('Return 200 and update notification preferences.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_notif');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/notifications`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          OrganizationInvitation: { email: true, inbox: false },
          PricingUpdated: { email: false, inbox: true },
        });

      expect(response.status).toBe(200);
      expect(response.body.settings).toHaveProperty('notificationPrefs');
    });

    it('Return 401 without authorization header.', async () => {
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/notifications`)
        .send({ pricingCreated: { email: true, inbox: true } });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/users/me/settings/avatar', () => {
    it('Return 200 and upload avatar image.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_avatar');
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const response = await request(app)
        .post(`${BASE_PATH}/users/me/settings/avatar`)
        .set('Authorization', `Bearer ${user.token}`)
        .attach('avatar', imageBuffer, { filename: 'test.png', contentType: 'image/png' });

      expect(response.status).toBe(200);
      expect(response.body.settings).toHaveProperty('avatar');
      expect(typeof response.body.settings?.avatar).toBe('string');
      expect(response.body.settings?.avatar).toContain('avatar');
    });

    it('Return 400 when no file is uploaded.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_avatar2');
      const response = await request(app)
        .post(`${BASE_PATH}/users/me/settings/avatar`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(400);
    });

    it('Return 401 without authorization header.', async () => {
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const response = await request(app)
        .post(`${BASE_PATH}/users/me/settings/avatar`)
        .attach('avatar', imageBuffer, { filename: 'test.png', contentType: 'image/png' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/users/me/settings/avatar', () => {
    it('Return 200 and remove avatar.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_del_avatar');
      const response = await request(app)
        .delete(`${BASE_PATH}/users/me/settings/avatar`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body.settings).toHaveProperty('avatar', null);
    });

    it('Return 401 without authorization header.', async () => {
      const response = await request(app)
        .delete(`${BASE_PATH}/users/me/settings/avatar`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/users/me/settings/avatar-colors', () => {
    it('Return 200 and update avatar colors.', async () => {
      const { user } = await createAndLoginUser('USER', 'settings_colors');
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/avatar-colors`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          avatarPath: 'static/avatars/users/default/avatar-1.svg',
          avatarBgColor: '#ff5733',
          avatarFgColor: '#ffffff',
        });

      expect(response.status).toBe(200);
      expect(response.body.settings).toHaveProperty('avatarBgColor', '#ff5733');
      expect(response.body.settings).toHaveProperty('avatarFgColor', '#ffffff');
    });

    it('Return 401 without authorization header.', async () => {
      const response = await request(app)
        .put(`${BASE_PATH}/users/me/settings/avatar-colors`)
        .send({ avatarBgColor: '#000000', avatarFgColor: '#ffffff' });

      expect(response.status).toBe(401);
    });
  });
});
