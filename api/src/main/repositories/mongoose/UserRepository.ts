import { LeanUser } from '../../types/models/User';
import RepositoryBase from '../RepositoryBase';
import UserMongoose from './models/UserMongoose';

class UserRepository extends RepositoryBase {
  async find(filter: any, offset: number = 0, limit: number = 10): Promise<LeanUser[]> {
    try {
      const users = await UserMongoose.find(filter, { password: 0 })
        .skip(offset)
        .limit(limit)
        .exec();
      return users.map(user => user.toObject());
    } catch (err) {
      return [];
    }
  }

  async findOne(filter: any): Promise<LeanUser | null> {
    try {
      const user = await UserMongoose.findOne(filter, { password: 0 }).exec();
      return user ? user.toObject() : null;
    } catch (err) {
      return null;
    }
  }

  async findById(id: string): Promise<LeanUser | null> {
    return await UserMongoose.findOne({ _id: id }).exec();
  }

  async findByToken(token: string): Promise<LeanUser | null> {
    return await UserMongoose.findOne({ token });
  }

  async findByEmail(email: string, selector: string = ""): Promise<LeanUser | null> {
    try {
      const user = await UserMongoose.findOne({ email }).select(selector).exec();
      return user ? user.toObject() : null;
    } catch (err) {
      return null;
    }
  }

  async findByUsername(username: string, selector: string = ""): Promise<LeanUser | null> {
    try {
      const user = await UserMongoose.findOne({ username }).select(selector).exec();
      const userObj = user ? user.toObject() : null;
      return userObj;
    } catch (err) {
      return null;
    }
  }

  async create(businessEntity: any) {
    const user = await new UserMongoose(businessEntity).save();

    return user.toObject();
  }

  async update(username: string, businessEntity: any): Promise<LeanUser | null> {
    const updatedUser = await UserMongoose.findOneAndUpdate({ username }, businessEntity, {
      new: true,
      projection: { password: 0 },
    });

    if (!updatedUser) {
      throw new Error('ERROR: Error while updating user. User not found.');
    }

    return updatedUser?.toObject() || null;
  }

  async updateToken(
    username: string,
    tokenDTO: { token: string; tokenExpiration: Date }
  ): Promise<LeanUser | null> {
    return await this.update(username, tokenDTO);
  }

  async destroy(username: string): Promise<boolean> {
    const result = await UserMongoose.deleteOne({ username }).exec();
    return result?.deletedCount === 1;
  }
}

export default UserRepository;
