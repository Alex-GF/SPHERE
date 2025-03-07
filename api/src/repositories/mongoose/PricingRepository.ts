import RepositoryBase from '../RepositoryBase';
import PricingMongoose from './models/PricingMongoose';
import { PricingAnalytics } from '../../types/database/Pricing';
import { getAllPricingsAggregator } from './aggregators/get-all-pricings';
import { PricingIndexQueryParams } from '../../types/services/PricingService';
import mongoose from 'mongoose';
import { getPricingByNameAndOwnerAggregator } from './aggregators/get-pricing-by-name-and-owner';

class PricingRepository extends RepositoryBase {
  async findAll(...args: any) {
    const queryParams: PricingIndexQueryParams = args[0];

    let filteringAggregators = [];
    let sortAggregator = [];

    if (Object.keys(queryParams).length > 0) {
      const { name, subscriptions, minPrice, maxPrice, selectedOwners, sortBy, sort } = queryParams;

      if (name) {
        filteringAggregators.push({
          $match: {
            name: {
              $regex: name,
              $options: 'i', // case-insensitive
            },
          },
        });
      }

      if (subscriptions) {
        const subscriptionsFilter = subscriptions as { min: number; max: number };

        filteringAggregators.push({
          $match: {
            'analytics.configurationSpaceSize': {
              $gte: !Number.isNaN(subscriptionsFilter.min) ? subscriptionsFilter.min : 0,
              $lte: !Number.isNaN(subscriptionsFilter.max)
                ? subscriptionsFilter.max
                : Number.MAX_SAFE_INTEGER,
            },
          },
        });
      }

      if (minPrice) {
        const minPriceFilter = minPrice as { min: number; max: number };

        filteringAggregators.push({
          $match: {
            'analytics.minSubscriptionPrice': {
              $gte: !Number.isNaN(minPriceFilter.min) ? minPriceFilter.min : 0,
              $lte: !Number.isNaN(minPriceFilter.max)
                ? minPriceFilter.max
                : Number.MAX_SAFE_INTEGER,
            },
          },
        });
      }

      if (maxPrice) {
        const maxPriceFilter = maxPrice as { min: number; max: number };

        filteringAggregators.push({
          $match: {
            'analytics.maxSubscriptionPrice': {
              $gte: !Number.isNaN(maxPriceFilter.min) ? maxPriceFilter.min : 0,
              $lte: !Number.isNaN(maxPriceFilter.max)
                ? maxPriceFilter.max
                : Number.MAX_SAFE_INTEGER,
            },
          },
        });
      }

      if (selectedOwners) {
        const selectedOwnersFilter = selectedOwners as string[];

        filteringAggregators.push({
          $match: {
            owner: {
              $in: selectedOwnersFilter,
            },
          },
        });
      }
      if (sortBy && sort) {
        let sortParameter = '';
        let sortOrder = sort === 'asc' ? 1 : -1;

        switch (sortBy) {
          case 'pricingName':
            sortParameter = 'name';
            break;
          case 'configurationSpaceSize':
            sortParameter = 'analytics.configurationSpaceSize';
            break;
          case 'featuresCount':
            sortParameter = 'analytics.numberOfFeatures';
            break;
          case 'usageLimitsCount':
            sortParameter = 'analytics.numberOfUsageLimits';
            break;
          case 'plansCount':
            sortParameter = 'analytics.numberOfPlans';
            break;
          case 'addonsCount':
            sortParameter = 'analytics.numberOfAddons';
            break;
          case 'minPrice':
            sortParameter = 'analytics.minSubscriptionPrice';
            break;
          case 'maxPrice':
            sortParameter = 'analytics.maxSubscriptionPrice';
            break;
        }
        sortAggregator.push({
          $addFields: {
            pricings: {
              $sortArray: {
                input: '$pricings',
                sortBy: {
                  [sortParameter]: sortOrder,
                },
              },
            },
          },
        });
      }
    }

    try {
      const aggregator = getAllPricingsAggregator(filteringAggregators, sortAggregator);
      const pricings = await PricingMongoose.aggregate([
        {
          $match: {
            private: false,
          },
        },
        ...aggregator,
      ]);
      return pricings[0];
    } catch (err) {
      return { pricings: [] };
    }
  }

  async findByOwnerWithoutCollection(owner: string, ...args: any) {
    try {
      const pricings = await PricingMongoose.aggregate([
        {
          $match: {
            owner: owner,
            _collectionId: { $exists: false },
          },
        },
        ...getAllPricingsAggregator([], []),
      ]);

      return pricings[0];
    } catch (err) {
      return [];
    }
  }

  async findByNameAndOwner(name: string, owner: string, ...args: any) {
    try {
      const pricing = await PricingMongoose.aggregate(getPricingByNameAndOwnerAggregator(name, owner));

      if (!pricing || pricing.length === 0) {
        return null;
      }

      return pricing[0];
    } catch (err) {
      return null;
    }
  }

  async create(data: any, ...args: any) {
    if (data._collectionId) {
      data._collectionId = new mongoose.Types.ObjectId(data._collectionId);
    }

    const pricing = new PricingMongoose(data);
    await pricing.save();

    return pricing;
  }

  async updateAnalytics(pricingId: string, analytics: PricingAnalytics, ...args: any) {
    const pricing = await PricingMongoose.findOne({ _id: pricingId });
    if (!pricing) {
      return null;
    }

    pricing.set({ analytics: analytics });
    await pricing.save();

    return pricing.toJSON();
  }

  async addPricingToCollection(pricingName: string, owner: string, collectionId: string) {
    return await PricingMongoose.updateMany(
      {
        name: pricingName,
        owner: owner,
      },
      {
        $set: { _collectionId: new mongoose.Types.ObjectId(collectionId) },
      }
    );
  }

  async addPricingsToCollection(
    collectionId: string,
    owner: string,
    pricings: string[],
    ...args: any
  ) {
    const result = await PricingMongoose.updateMany(
      { name: { $in: pricings }, owner: owner },
      { $set: { _collectionId: new mongoose.Types.ObjectId(collectionId) } }
    );

    return result.modifiedCount === pricings.length;
  }

  async update(id: string, data: any, ...args: any) {
    const pricing = await PricingMongoose.findOne({ _id: id });
    if (!pricing) {
      return null;
    }

    pricing.set(data);
    await pricing.save();

    return pricing.toJSON();
  }

  async removePricingFromCollection(pricingName: string, owner: string, ...args: any) {
    return await PricingMongoose.updateMany(
      {
        name: pricingName,
        owner: owner,
      },
      {
        $unset: { _collectionId: 1 },
      }
    );
  }

  async removePricingsFromCollection(collectionId: string) {
    return await PricingMongoose.updateMany(
      {
        _collectionId: new mongoose.Types.ObjectId(collectionId),
      },
      {
        $unset: { _collectionId: 1 },
      }
    );
  }

  async destroyByNameAndOwner(name: string, owner: string, ...args: any) {
    const result = await PricingMongoose.deleteMany({ name: name, owner: owner });
    return result.deletedCount >= 1;
  }

  async destroyVersionByNameAndOwner(name: string, version: string, owner: string, ...args: any) {
    const result = await PricingMongoose.deleteOne({
      $expr: {
        $and: [
          { $eq: [{ $toLower: '$name' }, name.toLowerCase()] },
          { $eq: ['$owner', owner] },
          { $eq: ['$version', version] },
        ],
      },
    });

    return result.deletedCount === 1;
  }

  async destroy(id: string, ...args: any) {
    const result = await PricingMongoose.deleteOne({ _id: id });
    return result?.deletedCount === 1;
  }
}

export default PricingRepository;
