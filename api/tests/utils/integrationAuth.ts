import request from 'supertest';
import UserMongoose from '../../src/repositories/mongoose/models/UserMongoose';
import { generateFakeUser } from './testData';
import type { TestApp } from './testApp';

export const buildUniqueString = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const buildUserPayload = (namePrefix = 'integration') => {
  const user = generateFakeUser('user', `${namePrefix}-${Math.random().toString(36).slice(2, 6)}`);
  const uniqueSuffix = `${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 5)}`;
  user.username = `u${uniqueSuffix}`.slice(0, 15);
  user.email = `u${uniqueSuffix}@example.com`;
  user.password = 'IntegrationUser_123';
  return user;
};

export const registerAndLoginUser = async (app: TestApp, namePrefix = 'integration-user') => {
  const user = buildUserPayload(namePrefix);

  const registerResponse = await request(app).post('/api/users/register').send(user);
  if (registerResponse.status !== 201) {
    throw new Error(`Could not register integration user: ${JSON.stringify(registerResponse.body)}`);
  }

  const loginResponse = await request(app).post('/api/users/login').send({
    loginField: user.email,
    password: user.password,
  });

  if (loginResponse.status !== 200) {
    throw new Error(`Could not login integration user: ${JSON.stringify(loginResponse.body)}`);
  }

  return {
    user,
    auth: loginResponse.body,
  };
};

export const ensureAdminAndLogin = async (app: TestApp) => {
  const adminEmail = 'integration-admin@sphere.com';
  const adminUsername = 'integ_admin';
  const adminPassword = 'IntegrationAdmin_123';

  const existingAdmin = await UserMongoose.findOne({ email: adminEmail });

  if (!existingAdmin) {
    await UserMongoose.create({
      firstName: 'Integration',
      lastName: 'Admin',
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      phone: '+34999999999',
      avatar: 'avatars/default-avatar.png',
      address: 'Integration Street 1',
      postalCode: '41001',
      userType: 'admin',
      token: buildUniqueString('admin-token'),
      tokenExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  const loginResponse = await request(app).post('/api/users/loginAdmin').send({
    loginField: adminEmail,
    password: adminPassword,
  });

  if (loginResponse.status !== 200) {
    throw new Error(`Could not login integration admin: ${JSON.stringify(loginResponse.body)}`);
  }

  return loginResponse.body;
};
