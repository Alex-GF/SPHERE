import UserMongoose from "../../main/repositories/mongoose/models/UserMongoose";
import { TEST_PASSWORD } from "./config/variables";

export const randomSuffix = () => Math.random().toString(36).substring(2, 10);


export const createGlobalAdminUser = async () => {
  const adminUserData = {
    username: 'testAdmin_' + randomSuffix(),
    password: TEST_PASSWORD,
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'User',
    email: `admin_${randomSuffix()}@test.com`,
    token: 'c5b77bc3ea8a2903fd38be45227903da58c72bbf',
    tokenExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    avatar: 'avatars/default-avatar.png',
  };

  const createdAdmin = new UserMongoose(adminUserData);
  const savedAdmin = await createdAdmin.save();
  return {
    ...adminUserData,
    id: savedAdmin._id.toString(),
  };
};

export const createGlobalTestUser = async () => {
  const testUserData = {
    username: 'testUser_' + randomSuffix(),
    password: TEST_PASSWORD,
    role: 'USER',
    firstName: 'John',
    lastName: 'Doe',
    email: `test_user_${randomSuffix()}@test.com`,
    token: '8f83882593eae31d5b8d449aaecffb9707367292',
    tokenExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    avatar: 'avatars/default-avatar.png',
  };

  const createdTestUser = new UserMongoose(testUserData);
  const savedTestUser = await createdTestUser.save();
  // Ensure the test user is not deleted during cleanup
  return {
    ...testUserData,
    id: savedTestUser._id.toString(),
  };
};