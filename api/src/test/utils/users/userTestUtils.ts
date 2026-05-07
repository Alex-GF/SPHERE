import UserMongoose from '../../../main/repositories/mongoose/models/UserMongoose';
import { UserRole, USER_ROLES } from '../../../main/types/config/permissions';
import { LeanUser } from '../../../main/types/models/User';
import { BASE_PATH, TEST_PASSWORD } from '../config/variables';
import request from 'supertest';
import testContainer from '../config/testContainer';
import { createMembership, createTestOrganizationDirect } from '../organizations';

// Create a test user directly in the database
export const createTestUser = async (
  role: UserRole = USER_ROLES[USER_ROLES.length - 1],
  username: string = `test_user_${Date.now()}`
): Promise<{ user: LeanUser; organizationId: string }> => {
  const userData = {
    username: username,
    password: TEST_PASSWORD,
    role,
    firstName: 'John',
    lastName: 'Doe',
    email: `${username}@example.com`,
  };

  // Create user directly in the database
  const user = new UserMongoose(userData);
  await user.save();

  const organization = await createTestOrganizationDirect({
    name: `${username}`,
    displayName: `${username} (Personal)`,
    isPersonal: true, 
    ancestors: [],   
  });

  createMembership(user.id, organization.id, 'OWNER');

  testContainer.resolve('usersToDelete').add(username);

  return { user: user.toObject(), organizationId: organization.id };
};

// Delete a test user directly from the database
export const deleteTestUser = async (username: string): Promise<void> => {
  await UserMongoose.deleteOne({ username: username });
};

export const createAndLoginUser = async (
  role: UserRole = USER_ROLES[USER_ROLES.length - 1],
  username: string = `test_user_${Date.now()}`
): Promise<{ user: LeanUser & { token: string; tokenExpiration: Date }; organizationId: string }> => {
  const {user, organizationId} = await createTestUser(role, username);

  const userLogin = await request(testContainer.resolve('app'))
    .post(`${BASE_PATH}/users/login`)
    .send({
      loginField: user.username,
      password: TEST_PASSWORD,
    });

  user.token = userLogin.body.token;
  user.tokenExpiration = userLogin.body.tokenExpiration;

  return { user: user as LeanUser & { token: string; tokenExpiration: Date }, organizationId };
};
