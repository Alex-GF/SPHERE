import mongoose from 'mongoose';
import { PricingCollectionAnalytics } from '../../types/database/PricingCollection';
import RepositoryBase from '../RepositoryBase';
import PricingCollectionMongoose from './models/PricingCollection';
import { processFileUris } from '../../services/FileService';
import { getAllPricingsFromCollection } from './aggregators/get-pricings-from-collection';

class PricingCollectionRepository extends RepositoryBase {
  async findAll(...args: any) {
    try {
      const collections = await PricingCollectionMongoose.find()
        .populate('owner', {
          username: 1,
          avatar: 1,
          id: 1,
        })
        .populate('numberOfPricings');

      collections.map((c: any) => processFileUris(c.owner, ['avatar']));
      return collections;
    } catch (err) {
      return null;
    }
  }

  async findByUserId(userId: string, ...args: any) {
    try {
      return await PricingCollectionMongoose.find({
        _ownerId: new mongoose.Types.ObjectId(userId),
      }).select('-analytics')
        .populate('owner', {
          username: 1,
          avatar: 1,
          id: 1,
        })
        .populate('numberOfPricings');
    } catch (err) {
      return null;
    }
  }

  async findByNameAndUserId(name: string, userId: string, ...args: any) {
    try {
      const collections = await PricingCollectionMongoose.aggregate([
        {
          $match: {
            name: {
              $regex: name,
              $options: 'i',
            },
            _ownerId: new mongoose.Types.ObjectId(userId),
          },
        },
        ...getAllPricingsFromCollection(),
        {
          $lookup: {
            from: 'users',
            localField: '_ownerId',
            foreignField: '_id',
            as: 'owner',
          },
        },
        {
          $unwind: {
            path: '$owner',
          },
        },
        {
          $project: {
            owner: {
              username: 1,
              avatar: 1,
              id: { $toString: '$owner._id' },
            },
            name: 1,
            analytics: 1,
            pricings: 1,
          },
        },
      ]);

      return collections[0];
    } catch (err) {
      console.log('[ERROR] An error occurred during the retrieval of the pricing collection');
      return null;
    }
  }

  async create(data: any, ...args: any) {
    const collection = new PricingCollectionMongoose(data);
    await collection.save();

    return collection.toJSON();
  }

  async updateAnalytics(pricingId: string, analytics: PricingCollectionAnalytics, ...args: any) {
    // TODO: Implement this method
  }

  async destroy(id: string, ...args: any) {
    const result = await PricingCollectionMongoose.deleteOne({ _id: id });
    return result?.deletedCount === 1;
  }

  async destroyWithPricings(id: string, ...args: any) {
    // TODO: Implement this method
  }
}

export default PricingCollectionRepository;
