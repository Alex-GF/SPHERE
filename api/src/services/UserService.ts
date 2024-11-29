import container from "../config/container";
import UserMockDB from "../repositories/mockDB/UserMockDB";
import { User } from "../repositories/mockDB/models/User";

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
  