import UserMongoose from '../../../main/repositories/mongoose/models/UserMongoose';
import { UserRole, USER_ROLES } from '../../../main/types/config/permissions';
import { LeanUser } from '../../../main/types/models/User';
import { BASE_PATH, TEST_PASSWORD } from '../config/variables';
import request from 'supertest';
import testContainer from '../config/testContainer';

// Create a test user directly in the database
export const createTestUser = async (role: UserRole = USER_ROLES[USER_ROLES.length - 1], username: string = `test_user_${Date.now()}`): Promise<any> => {
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

  testContainer.resolve('usersToDelete').add(username);
  
  return user.toObject();
};

// Delete a test user directly from the database
export const deleteTestUser = async (username: string): Promise<void> => {
  await UserMongoose.deleteOne({ username: username });
};

export const createAndLoginUser = async (role: UserRole = USER_ROLES[USER_ROLES.length - 1], username: string = `test_user_${Date.now()}`): Promise<LeanUser> => {
  const user = await createTestUser(role, username);

  const userLogin = await request(testContainer.resolve('app')).post(`${BASE_PATH}/users/login`).send({
    loginField: user.username,
    password: TEST_PASSWORD,
  });

  return { ...user, token: userLogin.body.token, tokenExpiration: userLogin.body.tokenExpiration };
};