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
import { CollectionIndexQueryParams } from '../../types/services/PricingCollection';

class PricingCollectionRepository extends RepositoryBase {
  async findAll(queryParams: CollectionIndexQueryParams, ...args: any) {
    
    let filteringAggregators = [];
    let sortAggregator = [];

    if (Object.keys(queryParams).length > 0){
      const { name, selectedOwners, sortBy, sort } = queryParams;

      if (name){
        filteringAggregators.push({
          $match: {
            name: {
              $regex: name,
              $options: 'i', // case-insensitive
            },
          },
        });
      }

      if (selectedOwners) {
        const selectedOwnersFilter = selectedOwners as string[];

        filteringAggregators.push({
          $match: {
            "owner.username": {
              $in: selectedOwnersFilter,
            },
          },
        });
      }
      if (sortBy && sort){

        let sortParameter = "";
        let sortOrder: 1 | -1 = sort === "asc" ? 1 : -1;

        switch (sortBy) {
          case 'numberOfPricings':
            sortParameter = "numberOfPricings";
            break;
          case 'configurationSpaceSize':
            sortParameter = "analytics.evolutionOfConfigurationSpaceSize.values";
            break;
          case 'numberOfFeatures':
            sortParameter = "analytics.evolutionOfFeatures.values";
            break;
          case 'numberOfPlans':
            sortParameter = "analytics.evolutionOfPlans.values";
            break;
          case 'numberOfAddons':
            sortParameter = "analytics.evolutionOfAddOns.values";
            break;
        };
        sortAggregator.push({
          $sort: {
            [sortParameter]: sortOrder,
          },
        });
      }
    }
    
    
    try {
      const collections = await PricingCollectionMongoose.aggregate([
        {
          $match: {
            private: false
          }
        },
        ...addNumberOfPricingsAggregator(),
        ...addOwnerToCollectionAggregator(),
        ...filteringAggregators,
        ...sortAggregator,
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
          $addFields: {
            id: { $toString: '$_id' },
          }
        },
        {
          $project: {
            id: 1,
            _id: 0,
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
          $addFields: {
            id: { $toString: '$_id' },
          }
        },
        {
          $project: {
            id: 1,
            owner: {
              username: 1,
              avatar: 1,
              id: { $toString: '$owner._id' },
            },
            name: 1,
            description: 1,
            private: 1,
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

  async update(collectionId: string, data: any) {
    
    const collection = await PricingCollectionMongoose.findById(collectionId);
    
    if (!collection) {
      throw new Error('Collection not found in database');
    }

    collection.set(data);
    await collection.save();

    return collection.toJSON();
  }

  async destroy(id: string, ...args: any) {
    const result = await PricingCollectionMongoose.deleteOne({ _id: id });
    return result?.deletedCount === 1;
  }

  async destroyWithPricings(id: string, ...args: any) {
    const resultPricings = await PricingMongoose.deleteMany({ _collectionId: new mongoose.Types.ObjectId(id) });
    const resultCollections = await PricingCollectionMongoose.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    return resultCollections?.deletedCount === 1 && resultPricings?.deletedCount > 0;
  }
}

export default PricingCollectionRepository;
