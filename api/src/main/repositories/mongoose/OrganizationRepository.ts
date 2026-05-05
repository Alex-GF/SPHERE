import RepositoryBase from '../RepositoryBase';
import OrganizationMongoose from './models/OrganizationMongoose';

class OrganizationRepository extends RepositoryBase {
  async findAll(queryParams: any) {
    try {
      const orgs = await OrganizationMongoose.find().sort({ createdAt: -1 });
      return orgs.map(org => org.toObject());
    } catch {
      return [];
    }
  }
  
  async findOne(filter: any) {
    try {
      const org = await OrganizationMongoose.findOne(filter).exec();
      return org ? org.toObject() : null;
    } catch {
      return null;
    }
  }

  async findById(id: string) {
    try {
      const org = await OrganizationMongoose.findById(id);
      return org ? org.toObject() : null;
    } catch {
      return null;
    }
  }

  async create(data: any) {
    const org = await new OrganizationMongoose(data).save();
    return org.toObject();
  }

  async update(id: string, data: any) {
    return OrganizationMongoose.findOneAndUpdate({ _id: id }, data, { new: true });
  }

  async destroy(id: string) {
    const result = await OrganizationMongoose.deleteOne({ _id: id });
    return result?.deletedCount === 1;
  }
}

export default OrganizationRepository;
