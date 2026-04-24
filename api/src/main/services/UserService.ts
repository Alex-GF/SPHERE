import container from '../config/container';
import UserRepository from '../repositories/mongoose/UserRepository';
import { USER_ROLES } from '../types/config/permissions';
import { LeanUser } from '../types/models/User';
import { processFileUris } from './FileService';
import bcrypt from 'bcryptjs';
import { generateUserTokenDTO, hashPassword } from '../utils/users/helpers';

class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = container.resolve('userRepository');
  }

  async show(username: string) {
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      throw new Error('User not found');
    }

    processFileUris(user, ['avatar']);

    const propertiesToBeRemoved = [
      'password',
      'createdAt',
      'updatedAt',
      'token',
      'tokenExpiration',
      'phone',
    ];

    const userObject = Object.assign({}, user);
    propertiesToBeRemoved.forEach(property => {
      delete (userObject as Record<string, any>)[property];
    });
    return userObject;
  }

  async register(newUser: any, creatorData: LeanUser) {
    // Stablish a default role if not provided
    if (!creatorData || !newUser.role) {
      newUser.role = USER_ROLES[USER_ROLES.length - 1];
    }

    if (creatorData && creatorData.role !== 'ADMIN' && newUser.role === 'ADMIN') {
      throw new Error('PERMISSION ERROR: Only admins can create other admins.');
    }

    const existingUser = await this.userRepository.findByUsername(newUser.username);

    if (existingUser) {
      throw new Error(
        'INVALID DATA: There is already a user with the username that you are trying to set'
      );
    }

    newUser.avatar = newUser.avatar || 'avatars/default-avatar.png';
    newUser = { ...newUser, ...generateUserTokenDTO() };

    const registeredUser = await this.userRepository.create(newUser);

    return registeredUser;
  }

  async loginByToken(token: string): Promise<LeanUser> {
    const user = await this.userRepository.findByToken(token);
    if (user && user.tokenExpiration! > new Date()) {
      processFileUris(user, ['avatar']);
      return user;
    }
    const errorMessage = user?.tokenExpiration! <= new Date() ? 'Token expired' : 'Token not valid';
    throw new Error(errorMessage);
  }

  async updateToken(token: string) {
    const user = await this.loginByToken(token);

    if (!user) {
      throw new Error('INVALID DATA: Token not valid');
    }

    const updatedUser = await this.userRepository.updateToken(
      user.username,
      generateUserTokenDTO()
    );

    return { token: updatedUser!.token, tokenExpiration: updatedUser!.tokenExpiration };
  }

  async login(loginField: string, password: string) {
    let user: LeanUser | null = await this.userRepository.findByUsername(loginField);

    if (!user) {
      user = await this.userRepository.findByEmail(loginField);
      if (!user) {
        throw new Error('INVALID DATA: Invalid credentials');
      }
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new Error('INVALID DATA: Invalid credentials');
    }

    const updatedUser = await this.userRepository.updateToken(
      user.username,
      generateUserTokenDTO()
    );

    return updatedUser;
  }

  async update(reqUser: LeanUser, targetUsername: string, data: any) {
    
    if(reqUser.username !== targetUsername && reqUser.role !== 'ADMIN') {
      throw new Error('PERMISSION ERROR: You can only update your own user data');
    }else if (data.role && reqUser.role !== 'ADMIN') {
      throw new Error('PERMISSION ERROR: You can only update user roles if you are an admin');
    }

    let userToUpdate = await this.userRepository.findByUsername(targetUsername);
    
    if (!userToUpdate) {
      throw new Error('INVALID DATA: User not found');
    }

    // Validación: no permitir degradar al último admin
    if (userToUpdate.role === 'ADMIN' && data.role && data.role !== 'ADMIN') {
      const allAdmins = await this.userRepository.find({role: 'ADMIN'});
      const adminCount = allAdmins.filter((u: LeanUser) => u.username !== targetUsername).length;
      if (adminCount < 1) {
        throw new Error('PERMISSION ERROR: There must always be at least one ADMIN user in the system.');
      }
    }

    if (data.username && data.username !== targetUsername) {
      const existingUser = await this.userRepository.findByUsername(data.username);
      if (existingUser) {
        throw new Error('INVALID DATA: There is already a user with the username that you are trying to set');
      }
    }

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    const user = await this.userRepository.update(targetUsername, data);
    
    processFileUris(user, ['avatar']);

    return user;
  }

  async destroy(reqUser: LeanUser, targetUsername: string) {
    if (reqUser.username !== targetUsername && reqUser.role !== 'ADMIN') {
      throw new Error('PERMISSION ERROR: You can only delete your own user');
    }

    const userToDelete = await this.userRepository.findByUsername(targetUsername);

    if (!userToDelete) {
      throw new Error('INVALID DATA: User not found');
    }

    // Validación: no permitir eliminar al último admin
    if (userToDelete.role === 'ADMIN') {
      const allAdmins = await this.userRepository.find({role: 'ADMIN'});
      const adminCount = allAdmins.filter((u: LeanUser) => u.username !== targetUsername).length;
      if (adminCount < 1) {
        throw new Error('PERMISSION ERROR: There must always be at least one ADMIN user in the system.');
      }
    }

    const result = await this.userRepository.destroy(targetUsername);
    if (!result) {
      throw new Error('INVALID DATA: User not found');
    }
    return true;
  }

  async exists(username: string) {
    return await this.userRepository.findByUsername(username);
  }
}

export default UserService;
