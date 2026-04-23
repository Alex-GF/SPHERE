import dotenv from 'dotenv';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getApp, shutdownApp } from './utils/testApp';
import type { TestApp } from './utils/testApp';
import { buildUserPayload, ensureAdminAndLogin, registerAndLoginUser } from './utils/integrationAuth';

dotenv.config();

describe('Users API integration', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await getApp();
  });

  describe('POST /api/users/register', () => {
    it('creates a standard user', async () => {
      const payload = buildUserPayload('register-user');

      const response = await request(app).post('/api/users/register').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.email).toBe(payload.email);
      expect(response.body.username).toBe(payload.username);
      expect(response.body.userType).toBe('user');
      expect(response.body.password).toBeUndefined();
    });

    it('returns 422 when login payload is invalid', async () => {
      const response = await request(app).post('/api/users/register').send({
        firstName: 'A',
        lastName: 'B',
      });

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('POST /api/users/login and /api/users/loginAdmin', () => {
    it('logs in with email and username for a created user', async () => {
      const { user } = await registerAndLoginUser(app, 'login-user');

      const loginByEmail = await request(app).post('/api/users/login').send({
        loginField: user.email,
        password: user.password,
      });
      const loginByUsername = await request(app).post('/api/users/login').send({
        loginField: user.username,
        password: user.password,
      });

      expect(loginByEmail.status).toBe(200);
      expect(loginByEmail.body.token).toBeDefined();
      expect(loginByUsername.status).toBe(200);
      expect(loginByUsername.body.token).toBeDefined();
    });

    it('returns 401 for invalid credentials', async () => {
      const response = await request(app).post('/api/users/login').send({
        loginField: 'invalid@sphere.test',
        password: 'invalid-password',
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('returns 422 for invalid loginField format', async () => {
      const response = await request(app).post('/api/users/login').send({
        loginField: 'not-valid-login-field@@',
        password: 'some-password',
      });

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('logs in as admin and returns token', async () => {
      const adminAuth = await ensureAdminAndLogin(app);

      expect(adminAuth.token).toBeDefined();
    });
  });

  describe('POST /api/users/registerAdmin', () => {
    it('creates a new admin with admin token', async () => {
      const adminAuth = await ensureAdminAndLogin(app);
      const payload = buildUserPayload('register-admin');

      const response = await request(app)
        .post('/api/users/registerAdmin')
        .set('Authorization', `Bearer ${adminAuth.token}`)
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.userType).toBe('admin');
      expect(response.body.password).toBeUndefined();
    });

    it('returns 401 without token', async () => {
      const payload = buildUserPayload('register-admin-no-token');

      const response = await request(app).post('/api/users/registerAdmin').send(payload);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/users/tokenLogin and /api/users/updateToken', () => {
    it('logs in by token for a valid user token', async () => {
      const { auth } = await registerAndLoginUser(app, 'token-login-user');

      const response = await request(app).post('/api/users/tokenLogin').send({ token: auth.token });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(auth.id);
      expect(response.body.token).toBe(auth.token);
    });

    it('returns 401 for invalid token in tokenLogin', async () => {
      const response = await request(app).post('/api/users/tokenLogin').send({ token: 'invalid-token' });

      expect(response.status).toBe(401);
    });

    it('returns 401 when calling updateToken without auth middleware', async () => {
      const response = await request(app).post('/api/users/updateToken').send({});

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No authorization header found');
    });

    it('returns 200 when calling updateToken with valid token', async () => {
      const { auth } = await registerAndLoginUser(app, 'update-token-user');

      const response = await request(app)
        .post('/api/users/updateToken')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.tokenExpiration).toBeDefined();
    });

    it('returns 401 when authorization header does not use Bearer scheme', async () => {
      const response = await request(app)
        .post('/api/users/updateToken')
        .set('Authorization', 'Token abc')
        .send({});

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/users and DELETE /api/users', () => {
    it('updates the authenticated user', async () => {
      const { auth } = await registerAndLoginUser(app, 'update-user');

      const response = await request(app)
        .put('/api/users')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ firstName: 'UpdatedName' });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('UpdatedName');
      expect(response.body.password).toBeUndefined();
    });

    it('returns 422 when update payload is invalid', async () => {
      const { auth } = await registerAndLoginUser(app, 'invalid-update-user');

      const response = await request(app)
        .put('/api/users')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ firstName: 123 });

      expect(response.status).toBe(422);
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('deletes the authenticated user', async () => {
      const { auth } = await registerAndLoginUser(app, 'delete-user');

      const response = await request(app)
        .delete('/api/users')
        .set('Authorization', `Bearer ${auth.token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBe('Successfully deleted.');
    });
  });

  describe('GET /users/:userId', () => {
    it('returns public user info using the non-prefixed route', async () => {
      const { auth } = await registerAndLoginUser(app, 'public-user');

      const response = await request(app)
        .get(`/users/${auth.id}`)
        .set('Authorization', `Bearer ${auth.token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(auth.id);
      expect(response.body.password).toBeUndefined();
      expect(response.body.phone).toBeUndefined();
    });

    it('returns 404 when user id does not exist', async () => {
      const { auth } = await registerAndLoginUser(app, 'public-user-404');

      const response = await request(app)
        .get('/users/507f191e810c19729de860ea')
        .set('Authorization', `Bearer ${auth.token}`);

      expect(response.status).toBe(404);
    });
  });

  afterAll(async () => {
    await shutdownApp();
  });
});
