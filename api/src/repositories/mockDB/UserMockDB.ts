import RepositoryBase from '../RepositoryBase';
import {User} from './models/User';
import { userData } from './data/UserData';

class UserMockDB extends RepositoryBase {
  override async findAll(): Promise<User[]> {
    return userData;
  }
}

export default UserMockDB;
