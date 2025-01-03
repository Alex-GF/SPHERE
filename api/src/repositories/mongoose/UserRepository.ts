import RepositoryBase from '../RepositoryBase';
import UserMongoose from './models/UserMongoose';

class UserRepository extends RepositoryBase {
  async findById (id: string, ...args: any) {
    try {
      const user = await UserMongoose.findById(id, { password: 0 })
      return user!.toObject({ getters: true, virtuals: true, versionKey: false })
    } catch (err) {
      return null
    }
  }

  async create (businessEntity: any, ...args: any) {
    return (new UserMongoose(businessEntity)).save()
  }

  async update (id: string, businessEntity: any, ...args: any) {
    return UserMongoose.findOneAndUpdate({ _id: id }, businessEntity, { new: true, exclude: ['password'] })
  }

  async updateToken (id: string, tokenDTO: {token: string, tokenExpiration: Date}, ...args: any) {
    return this.update(id, tokenDTO, args)
  }

  async destroy (id: string, ...args: any) {
    const result = await UserMongoose.deleteOne({ _id: id })
    return result?.deletedCount === 1
  }

  async save (entity: any) {
    return UserMongoose.findByIdAndUpdate(entity.id, entity, { upsert: true, new: true })
  }

  async findAdminByEmail (email: string) {
    return this._findByEmailAndUserType(email, 'admin')
  }

  async findUserByEmail (email: string) {
    return this._findByEmailAndUserType(email, 'user')
  }

  async _findByEmailAndUserType (email: string, userType: "user" | "admin") {
    return UserMongoose.findOne({ email, userType }, { id: 1, password: 1})
  }
}

export default UserRepository
