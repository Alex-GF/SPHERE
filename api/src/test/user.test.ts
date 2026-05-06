import dotenv from 'dotenv';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { shutdownApp, TestApp } from './utils/testApp';
import { createTestUser, deleteTestUser } from './utils/users/userTestUtils';
import { LeanUser } from '../main/types/models/User';
import { BASE_PATH, TEST_PASSWORD } from './utils/config/variables';
import testContainer from './utils/config/testContainer';

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
      const newUser1 = await createTestUser('USER');
      const newUser2 = await createTestUser('USER');

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
      const newUser1 = await createTestUser('USER');
      await createTestUser('USER');

      const response = await request(app)
        .get(`${BASE_PATH}/users?username=${newUser1.username.substring(10, 15)}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThan(3);
    });

    it('Return 200 and array of users with ADMIN role and email filter.', async () => {
      const newUser1 = await createTestUser('USER');
      await createTestUser('USER');

      const response = await request(app)
        .get(`${BASE_PATH}/users?email=${newUser1.email.substring(10, 15)}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThan(3);
    });
  });

  describe('GET /api/users/me', () => {
    it('Return 200 and user object with valid Bearer Authorization header.', async () => {
      const user = await createTestUser('USER');

      const response = await request(app)
        .get(`${BASE_PATH}/users/me`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body.username).toBe(user.username);
      expect(response.body.email).toBe(user.email);
      expect(response.body.role).toBe(user.role);
    });
    
    it('Return 401 with structurally valid token not linked to user', async () => {
      const user = await createTestUser('USER');

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
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const loginByEmail = await request(app).post(`${BASE_PATH}/users/login`).send({
        loginField: user.email,
        password: TEST_PASSWORD,
      });

      expect(loginByEmail.status).toBe(200);
      expect(loginByEmail.body.token).toBeDefined();
    });

    it('Return 200 and token object with username as loginField parameter.', async () => {
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const loginByUsername = await request(app).post(`${BASE_PATH}/users/login`).send({
        loginField: user.username,
        password: TEST_PASSWORD,
      });

      expect(loginByUsername.status).toBe(200);
      expect(loginByUsername.body.token).toBeDefined();
    });

    it('Return 401 and error object with wrong password parameter.', async () => {
      const user = await createTestUser('USER');
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
      const user = await createTestUser('USER');
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
      const user = await createTestUser('USER');
      const otherUser = await createTestUser('USER');
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
      const targetUser = await createTestUser('USER');

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
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app).get(`${BASE_PATH}/users/${user.username}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with malformed Authorization header.', async () => {
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .get(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', 'Token malformed');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 404 and not found object with non-existing username parameter.', async () => {
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .get(`${BASE_PATH}/users/nonexistent_user`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:username', () => {
    it('Return 200 and updated user object with owner editing own profile parameters.', async () => {
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const payload = {
        firstName: 'UpdatedName',
        lastName: 'UpdatedLastName',
        email: 'updated@example.com'
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
      const user = await createTestUser('USER');
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
      const targetUser = await createTestUser('USER');

      const response = await request(app)
        .put(`${BASE_PATH}/users/${targetUser.username}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ role: 'ADMIN' });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('ADMIN');
    });

    it('Return 403 and error object with regular user updating another username parameter.', async () => {
      const user = await createTestUser('USER');
      const otherUser = await createTestUser('USER');
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
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ role: 'ADMIN' });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('only update user roles');
    });

    it('Return 422 and validation errors object with invalid email parameter.', async () => {
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('Return 422 and error object with duplicated username parameter.', async () => {
      const user = await createTestUser('USER');
      const existingUser = await createTestUser('USER');
      usersToDelete.add(existingUser.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ username: existingUser.username });

      expect(response.status).toBe(422);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with missing Authorization header.', async () => {
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}`)
        .send({ firstName: 'NoAuth' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 404 and not found object with non-existing username parameter.', async () => {
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/nonexistent_user`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({ firstName: 'Ghost' });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:username/refresh-token', () => {
    it('Return 200 and token object with valid Bearer Authorization header.', async () => {
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}/refresh-token`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.tokenExpiration).toBeDefined();
      expect(response.body.token).not.toBe(user.token);
    });

    it('Return 401 and error object with missing Authorization header.', async () => {
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app).put(`${BASE_PATH}/users/${user.username}/refresh-token`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with malformed Authorization header.', async () => {
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}/refresh-token`)
        .set('Authorization', 'Token abc123');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with invalid Bearer token parameter.', async () => {
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}/refresh-token`)
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it("Return 403 with USER role attempting to update user's token.", async () => {
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .put(`${BASE_PATH}/users/${user.username}/refresh-token`)
        .set('Authorization', `Bearer ${testUser.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and 200 responses with old token invalidation after token regeneration.', async () => {
      const testAdminUser = await createTestUser('ADMIN');

      const refreshResponse = await request(app)
        .put(`${BASE_PATH}/users/${testAdminUser.username}/refresh-token`)
        .set('Authorization', `Bearer ${testAdminUser.token}`);
      expect(refreshResponse.status).toBe(200);

      const oldTokenResponse = await request(app)
        .put(`${BASE_PATH}/users/${testAdminUser.username}/refresh-token`)
        .set('Authorization', `Bearer ${testAdminUser.token}`);
      expect(oldTokenResponse.status).toBe(401);

      const newTokenResponse = await request(app)
        .put(`${BASE_PATH}/users/${testAdminUser.username}/refresh-token`)
        .set('Authorization', `Bearer ${refreshResponse.body.token}`);
      expect(newTokenResponse.status).toBe(200);
      expect(newTokenResponse.body.token).toBeDefined();
    });
  });

  describe('DELETE /api/users/:username', () => {
    it('Return 200 and success message object with owner deleting own username parameter.', async () => {
      const user = await createTestUser('USER');
      usersToDelete.add(user.username);

      const response = await request(app)
        .delete(`${BASE_PATH}/users/${user.username}`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Successfully deleted.');
    });

    it('Return 200 and success message object with admin deleting another username parameter.', async () => {
      const targetUser = await createTestUser('USER');

      const response = await request(app)
        .delete(`${BASE_PATH}/users/${targetUser.username}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Successfully deleted.');
    });

    it('Return 403 and error object with regular user deleting another username parameter.', async () => {
      const user = await createTestUser('USER');
      const otherUser = await createTestUser('USER');
      usersToDelete.add(user.username);
      usersToDelete.add(otherUser.username);

      const response = await request(app)
        .delete(`${BASE_PATH}/users/${otherUser.username}`)
        .set('Authorization', `Bearer ${user.token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    it('Return 401 and error object with missing Authorization header.', async () => {
      const user = await createTestUser('USER');
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
  });
});
