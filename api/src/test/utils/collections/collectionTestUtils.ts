import { TestCollection } from '../../types/Collections';
import PricingCollectionMongoose from '../../../main/repositories/mongoose/models/PricingCollectionMongoose';
import testContainer from '../config/testContainer';
import { BASE_PATH } from '../config/variables';
import request from 'supertest';

export const createTestCollection = (owner: string): Promise<TestCollection> => {
  const collectionData: Omit<TestCollection, 'id'> = {
    name: 'Test_Collection_' + Math.random().toString(36).substring(2, 15),
    description: 'This is a test collection',
    _ownerName: owner,
    private: false,
    analytics: {
      evolutionOfPlans: { dates: [], values: [] },
      evolutionOfAddOns: { dates: [], values: [] },
      evolutionOfFeatures: { dates: [], values: [] },
      evolutionOfConfigurationSpaceSize: { dates: [], values: [] },
    },
  };

  const collection = new PricingCollectionMongoose(collectionData);
  return collection.save().then(savedCollection => {
    return {
      id: savedCollection._id.toString(),
      ...collectionData,
    };
  });
};

export const createCollectionForUser = async (owner: string) => {
  const collection = await createTestCollection(owner);

  testContainer.resolve('collectionIdsToDelete').add(collection.id);
  return collection;
};

export const createCollectionViaApi = async (token: string, username: string, body: any): Promise<request.Response> => {
    return request(testContainer.resolve('app'))
      .post(`${BASE_PATH}/collections/${username}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  };