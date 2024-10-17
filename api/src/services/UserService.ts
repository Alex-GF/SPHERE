import container from "../config/container.ts";
import UserMockDB from "../repositories/mockDB/UserMockDB.ts";
import { User } from "../repositories/mockDB/models/User.ts";

class UserService {
    
    private userRepository: UserMockDB;

    constructor () {
      this.userRepository = container.resolve('userRepository');
    }
  
    async getAll (): Promise<User[]> {
      const userList = await this.userRepository.findAll()
      
      return userList;
    }
  }
  
  export default UserService
  