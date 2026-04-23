import UserMongoose from '../../../main/repositories/mongoose/models/UserMongoose';
import { UserRole, USER_ROLES } from '../../../main/types/config/permissions';

// Create a test user directly in the database
export const createTestUser = async (role: UserRole = USER_ROLES[USER_ROLES.length - 1], username: string = `test_user_${Date.now()}`): Promise<any> => {
  const userData = {
    username: username,
    password: 'password123',
    role,
    firstName: 'John',
    lastName: 'Doe',
    email: `${username}@example.com`,
  };

  // Create user directly in the database
  const user = new UserMongoose(userData);
  await user.save();
  
  return user.toObject();
};

// Delete a test user directly from the database
export const deleteTestUser = async (username: string): Promise<void> => {
  await UserMongoose.deleteOne({ username: username });
};
