import dotenv from 'dotenv';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getApp, shutdownApp } from './utils/testApp';
import type { TestApp } from './utils/testApp';
import { ensureAdminAndLogin, registerAndLoginUser } from './utils/integrationAuth';

dotenv.config();

describe('Pairwise auth and routing integration', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await getApp();
  });

  describe('pairwise matrix for login variants', () => {
    it('covers pairwise login dimensions across user/admin endpoints', async () => {
      const userSession = await registerAndLoginUser(app, 'pairwise-login-user');
      await ensureAdminAndLogin(app);

      const matrix = [
        {
          endpoint: '/api/users/login',
          loginField: userSession.user.email,
          password: userSession.user.password,
          expected: 200,
        },
        {
          endpoint: '/api/users/login',
          loginField: userSession.user.username,
          password: userSession.user.password,
          expected: 200,
        },
        {
          endpoint: '/api/users/login',
          loginField: userSession.user.email,
          password: 'wrong-password',
          expected: 401,
        },
        {
          endpoint: '/api/users/login',
          loginField: 'not-an-email',
          password: userSession.user.password,
          expected: 422,
        },
        {
          endpoint: '/api/users/loginAdmin',
          loginField: 'integration-admin@sphere.com',
          password: 'IntegrationAdmin_123',
          expected: 200,
        },
        {
          endpoint: '/api/users/loginAdmin',
          loginField: 'integ_admin',
          password: 'IntegrationAdmin_123',
          expected: 200,
        },
        {
          endpoint: '/api/users/loginAdmin',
          loginField: 'integration-admin@sphere.com',
          password: 'wrong-password',
          expected: 401,
        },
        {
          endpoint: '/api/users/loginAdmin',
          loginField: 'admin-invalid-format',
          password: 'IntegrationAdmin_123',
          expected: 422,
        },
      ] as const;

      for (const scenario of matrix) {
        const response = await request(app).post(scenario.endpoint).send({
          loginField: scenario.loginField,
          password: scenario.password,
        });

        expect(response.status).toBe(scenario.expected);
      }
    });
  });

  describe('pairwise matrix for protected endpoint authorization headers', () => {
    it('covers Bearer, missing, malformed and invalid tokens', async () => {
      const { auth } = await registerAndLoginUser(app, 'pairwise-protected-user');

      const cases = [
        {
          route: '/api/me/pricings',
          method: 'get',
          header: undefined,
          expected: 401,
        },
        {
          route: '/api/me/pricings',
          method: 'get',
          header: 'Token abc',
          expected: 401,
        },
        {
          route: '/api/me/pricings',
          method: 'get',
          header: 'Bearer invalid',
          expected: 401,
        },
        {
          route: '/api/me/pricings',
          method: 'get',
          header: `Bearer ${auth.token}`,
          expected: 200,
        },
        {
          route: '/api/users',
          method: 'put',
          header: undefined,
          expected: 401,
          body: { firstName: 'Pairwise' },
        },
        {
          route: '/api/users',
          method: 'put',
          header: 'Token abc',
          expected: 401,
          body: { firstName: 'Pairwise' },
        },
        {
          route: '/api/users',
          method: 'put',
          header: `Bearer ${auth.token}`,
          expected: 200,
          body: { firstName: 'PairwiseUpdated' },
        },
      ] as const;

      for (const scenario of cases) {
        let req = request(app)[scenario.method](scenario.route);
        if (scenario.header) {
          req = req.set('Authorization', scenario.header);
        }
        if ('body' in scenario && scenario.body) {
          req = req.send(scenario.body);
        }

        const response = await req;
        expect(response.status).toBe(scenario.expected);
      }
    });
  });

  afterAll(async () => {
    await shutdownApp();
  });
});
