import { TestCollection } from "../../types/Collections";
import PricingCollectionMongoose from "../../../main/repositories/mongoose/models/PricingCollectionMongoose";

export const createTestCollection = (ownerId: string): Promise<TestCollection> => {
  const collectionData: Omit<TestCollection, 'id'> = {
    name: 'Test_Collection_' + Math.random().toString(36).substring(2, 15),
    description: 'This is a test collection',
    _ownerId: ownerId,
    private: false,
    analytics: {
      evolutionOfPlans: { dates: [], values: [] },
      evolutionOfAddOns: { dates: [], values: [] },
      evolutionOfFeatures: { dates: [], values: [] },
      evolutionOfConfigurationSpaceSize: { dates: [], values: [] },
    }
  };

  const collection = new PricingCollectionMongoose(collectionData);
  return collection.save().then(savedCollection => {
    return {
      id: savedCollection._id.toString(),
      ...collectionData,
    };
  });
};