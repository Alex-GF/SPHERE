import mongoose from 'mongoose';
import RepositoryBase from '../RepositoryBase';
import OrganizationMembershipMongoose from './models/OrganizationMembershipMongoose';
import { OrgRole, ROLE_WEIGHT } from '../../types/models/Organization';

class OrganizationMembershipRepository extends RepositoryBase {
  async findByUserId(userId: string) {
    try {
      return await OrganizationMembershipMongoose.aggregate([
        { $match: { _userId: new mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'organizations',
            localField: '_organizationId',
            foreignField: '_id',
            as: 'organization',
          },
        },
        { $unwind: '$organization' },
        {
          $addFields: {
            id: { $toString: '$_id' },
            'organization.id': { $toString: '$organization._id' },
          },
        },
        {
          $project: {
            _id: 0,
            id: 1,
            _userId: 1,
            _organizationId: 1,
            role: 1,
            joinedAt: 1,
            organization: { id: 1, name: 1, displayName: 1, avatarUrl: 1, isPersonal: 1 },
          },
        },
      ]);
    } catch {
      return [];
    }
  }

  async findByOrganizationId(organizationId: string) {
    try {
      return await OrganizationMembershipMongoose.aggregate([
        { $match: { _organizationId: new mongoose.Types.ObjectId(organizationId) } },
        {
          $lookup: {
            from: 'users',
            localField: '_userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $addFields: {
            id: { $toString: '$_id' },
            'user.id': { $toString: '$user._id' },
          },
        },
        {
          $project: {
            _id: 0,
            id: 1,
            _userId: 1,
            _organizationId: 1,
            role: 1,
            joinedAt: 1,
            user: { id: 1, username: 1, email: 1, avatar: 1 },
          },
        },
      ]);
    } catch {
      return [];
    }
  }

  async findUserRoleInOrganization(userId: string, organizationId: string): Promise<OrgRole | null> {
    try {
      const membership = await OrganizationMembershipMongoose.aggregate([
        {
          $lookup: {
            from: 'organizations',
            let: { targetOrgId: new mongoose.Types.ObjectId(organizationId) },
            pipeline: [
              { $match: { $expr: { $eq: ['$_id', '$$targetOrgId'] } } },
              { $project: { ancestors: 1 } },
            ],
            as: 'targetOrg',
          },
        },
        { $unwind: '$targetOrg' },
        {
          $match: {
            _userId: new mongoose.Types.ObjectId(userId),
            $expr: {
              $in: [
                '$_organizationId',
                {
                  $concatArrays: [[new mongoose.Types.ObjectId(organizationId)], '$targetOrg.ancestors'],
                },
              ],
            },
          },
        },
        {
          $addFields: {
            roleWeight: {
              $switch: {
                branches: [
                  { case: { $eq: ['$role', 'OWNER'] }, then: 3 },
                  { case: { $eq: ['$role', 'ADMIN'] }, then: 2 },
                  { case: { $eq: ['$role', 'MEMBER'] }, then: 1 },
                ],
                default: 0,
              },
            },
          },
        },
        { $sort: { roleWeight: -1 } },
        { $limit: 1 },
      ]);
      return membership.length > 0 ? membership[0].role : null;
    } catch {
      return null;
    }
  }

  async create(data: any) {
    const membership = new OrganizationMembershipMongoose(data);
    await membership.save();
    return membership.toObject({ getters: true, virtuals: true, versionKey: false });
  }

  async updateByUserAndOrganization(userId: string, organizationId: string, data: any) {
    if (data.role) {
      data._roleWeight = ROLE_WEIGHT[data.role as keyof typeof ROLE_WEIGHT] ?? 0;
    }
    return OrganizationMembershipMongoose.findOneAndUpdate(
      {
        _userId: new mongoose.Types.ObjectId(userId),
        _organizationId: new mongoose.Types.ObjectId(organizationId),
      },
      data,
      { new: true }
    );
  }

  async destroyByUserAndOrganization(userId: string, organizationId: string) {
    const result = await OrganizationMembershipMongoose.deleteOne({
      _userId: new mongoose.Types.ObjectId(userId),
      _organizationId: new mongoose.Types.ObjectId(organizationId),
    });
    return result?.deletedCount === 1;
  }

  async destroyByOrganizationId(organizationId: string) {
    await OrganizationMembershipMongoose.deleteMany({
      _organizationId: new mongoose.Types.ObjectId(organizationId),
    });
    return true;
  }

  async destroyByUserId(userId: string) {
    await OrganizationMembershipMongoose.deleteMany({
      _userId: new mongoose.Types.ObjectId(userId),
    });
    return true;
  }
}

export default OrganizationMembershipRepository;
