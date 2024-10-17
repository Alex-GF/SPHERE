import RepositoryBase from '../RepositoryBase.ts';
import {User} from './models/User.ts';
import { userData } from './data/UserData.ts';

class UserMockDB extends RepositoryBase {
  override async findAll(): Promise<User[]> {
    return userData;
  }
}

export default UserMockDB;
