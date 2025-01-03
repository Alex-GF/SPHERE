import container from "../config/container";
import { User } from "../types/database/User";
import { UserRepository } from "../types/repositories/UserRepository";
import { processFileUris } from "./FileService";
import bcrypt from "bcryptjs";
import crypto from "crypto";

class UserService {
    
    private userRepository: UserRepository;

    constructor () {
      this.userRepository = container.resolve('userRepository');
    }
  
    async getAll (): Promise<User[]> {
      const userList = await this.userRepository.findAll()
      
      return userList;
    }

    _createUserTokenDTO () {
      return {
        token: crypto.randomBytes(20).toString('hex'),
        tokenExpiration: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      }
    }

    async _register (newUser: any, userType: "user" | "admin") {
      newUser.userType = userType
      newUser = { ...newUser, ...this._createUserTokenDTO() }
      const registeredUser = await this.userRepository.create(newUser)
      processFileUris(registeredUser, ['avatar'])
      return registeredUser
    }
  
    async registerUser (data: any) {
      return this._register(data, 'user')
    }
  
    async registerAdmin (data: any) {
      return this._register(data, 'admin')
    }

    async loginByToken (token: string) {
      const user = await this.userRepository.findByToken(token)
      if (user && user.tokenExpiration! > new Date()) {
        processFileUris(user, ['avatar'])
        return user
      }
      const errorMessage = user?.tokenExpiration! <= new Date() ? 'Token expired' : 'Token not valid'
      throw new Error(errorMessage)
    }

    async _login (email: string, password: string, userType: "user" | "admin") {
    
      let user
  
      if (userType === 'user') {
        user = await this.userRepository.findUserByEmail(email)
      } else if (userType === 'admin') {
        user = await this.userRepository.findAdminByEmail(email)
      }

      if (!user) {
        throw new Error('Invalid email or password')
      }

      const passwordValid = await bcrypt.compare(password, user.password)
      if (!passwordValid) {
        throw new Error('Invalid email or password')
      }
      const updatedUser = await this.userRepository.updateToken(user.id, this._createUserTokenDTO())
      processFileUris(updatedUser, ['avatar'])
      return updatedUser
    }
  
    async loginAdmin (email: string, password: string) {
      return this._login(email, password, 'admin')
    }
  
    async loginUser (email: string, password: string) {
      return this._login(email, password, 'user')
    }
  
    async show (id: string) {
      const user = await this.userRepository.findById(id)
      if (!user) {
        throw new Error('User not found')
      }
      processFileUris(user, ['avatar'])
      const propertiesToBeRemoved = ['password', 'createdAt', 'updatedAt', 'token', 'tokenExpiration', 'phone']
      const userObject = Object.assign({}, user)
      propertiesToBeRemoved.forEach((property) => {
        delete (userObject as Record<string, any>)[property]
      })
      return userObject
    }
  
    async update (id: string, data: any) {
      const user = await this.userRepository.update(id, data)
      if (!user) {
        throw new Error('User not found')
      }
      processFileUris(user, ['avatar'])
      return user
    }
  
    async destroy (id: string) {
      const result = await this.userRepository.destroy(id)
      if (!result) {
        throw new Error('User not found')
      }
      return true
    }
  
    async exists (id: string) {
      return await this.userRepository.findById(id)
    }
  }
  
  export default UserService
  