import mongoose from 'mongoose';
import { PricingCollectionAnalyticsToAdd } from '../../types/database/PricingCollection';
import RepositoryBase from '../RepositoryBase';
import PricingCollectionMongoose from './models/PricingCollectionMongoose';
import PricingMongoose from './models/PricingMongoose';
import { processFileUris } from '../../services/FileService';
import { getAllPricingsFromCollection } from './aggregators/get-pricings-from-collection';
import { addNumberOfPricingsAggregator } from './aggregators/pricingCollections/add-number-of-pricings';
import { addOwnerToCollectionAggregator } from './aggregators/pricingCollections/add-owner-to-collection';
import { addLastPricingUpdateAggregator } from './aggregators/pricingCollections/add-last-pricing-update';

class PricingCollectionRepository extends RepositoryBase {
  async findAll(...args: any) {
    try {
      const collections = await PricingCollectionMongoose.aggregate([
        ...addNumberOfPricingsAggregator(),
        ...addOwnerToCollectionAggregator(),
        {
          $project: {
            owner: {
              username: 1,
              avatar: 1,
              id: { $toString: '$owner._id' },
            },
            name: 1,
            analytics: 1,
            numberOfPricings: 1,
          },
        },
      ]);

      collections.forEach((c: any) => processFileUris(c.owner, ['avatar']));
      return collections;
    } catch (err) {
      return null;
    }
  }

  async findById(id: string, ...args: any) {
    try {
      const collections = await PricingCollectionMongoose.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        ...getAllPricingsFromCollection(),
        {
          $project: {
            name: 1,
            description: 1,
            analytics: 1,
            pricings: 1,
          },
        },
      ]);

      return collections[0];
    } catch (err) {
      return null;
    }
  }

  async findByUserId(userId: string, ...args: any) {
    try {
      const collections = await PricingCollectionMongoose.aggregate([
        {
          $match: {
            _ownerId: new mongoose.Types.ObjectId(userId),
          },
        },
        ...addNumberOfPricingsAggregator(),
        ...addOwnerToCollectionAggregator(),
        {
          $project: {
            owner: {
              username: 1,
              avatar: 1,
              id: { $toString: '$owner._id' },
            },
            name: 1,
            numberOfPricings: 1,
          },
        },
      ]);

      return collections;
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
        ...addOwnerToCollectionAggregator(),
        ...addLastPricingUpdateAggregator(),
        {
          $project: {
            owner: {
              username: 1,
              avatar: 1,
              id: { $toString: '$owner._id' },
            },
            name: 1,
            description: 1,
            analytics: 1,
            pricings: 1,
            lastUpdate: 1,
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

    return collection.populate('owner', {
      username: 1,
      avatar: 1,
      id: 1,
    });
  }

  async updateAnalytics(
    collectionId: mongoose.Types.ObjectId,
    analytics: PricingCollectionAnalyticsToAdd,
    ...args: any
  ) {
    const updateData: any = {};
    for (const key in analytics) {
      if (analytics.hasOwnProperty(key)) {
        updateData[`analytics.${key}.dates`] = new Date (analytics[key].date);
        updateData[`analytics.${key}.values`] = analytics[key].value;
      }
    }

    return await PricingCollectionMongoose.updateOne(
      { _id: collectionId },
      {
        $push: updateData,
      }
    );
  }

  async destroy(id: string, ...args: any) {
    const result = await PricingCollectionMongoose.deleteOne({ _id: id });
    return result?.deletedCount === 1;
  }

  async destroyWithPricings(id: string, ...args: any) {
    const result = await PricingCollectionMongoose.deleteOne({ _id: id });
    const result2 = await PricingMongoose.deleteMany({ _collectionId: id });
    return result?.deletedCount === 1 && result2?.deletedCount > 0;
  }
}

export default PricingCollectionRepository;
