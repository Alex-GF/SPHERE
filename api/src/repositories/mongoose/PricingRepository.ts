import RepositoryBase from '../RepositoryBase';
import PricingMongoose from './models/PricingMongoose';
import { PricingAnalytics } from '../../types/database/Pricing';

class PricingRepository extends RepositoryBase {
  async findAll(...args: any) {
    try {
      const pricings = await PricingMongoose.aggregate([
        {
          $group: {
            _id: {
              name: '$name',
            },
            versions: {
              $push: {
                version: '$version',
                extractionDate: '$extractionDate',
                url: '$url',
                yaml: '$yaml',
                analytics: '$analytics',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id.name',
            versions: 1,
          },
        },
      ]);
      return pricings;
    } catch (err) {
      return [];
    }
  }

  async findByName(name: string, ...args: any) {
    try {
      const pricing = await PricingMongoose.aggregate([
        {
          $match: {
            $expr: {
              $eq: [{ $toLower: '$name' }, { $toLower: name }],
            },
          },
        },
        {
          $group: {
            _id: {
              name: '$name',
            },
            versions: {
              $push: {
                version: '$version',
                extractionDate: '$extractionDate',
                url: '$url',
                yaml: '$yaml',
                analytics: '$analytics',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id.name',
            versions: 1,
          },
        },
      ]);

      if (!pricing || pricing.length === 0) {
        return null;
      }

      return pricing[0];
    } catch (err) {
      return null;
    }
  }

  async create(data: any, ...args: any) {
    const pricing = new PricingMongoose(data);
    await pricing.save()

    return pricing.toJSON();
  }

  async updateAnalytics(pricingId: string, analytics: PricingAnalytics, ...args: any) {
    const pricing = await PricingMongoose.findOne({ _id: pricingId });
    if (!pricing) {
      return null;
    }

    pricing.set({analytics: analytics});
    await pricing.save();

    return pricing.toJSON();
  }

  async destroy(id: string, ...args: any) {
    const result = await PricingMongoose.deleteOne({ _id: id });
    return result?.deletedCount === 1;
  }
}

export default PricingRepository;
