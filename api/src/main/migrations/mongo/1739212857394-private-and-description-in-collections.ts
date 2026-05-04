// Import your schemas here
import type { Connection } from 'mongoose';
import PricingCollectionMongoose from '../../repositories/mongoose/models/PricingCollectionMongoose';

export async function up (connection: Connection): Promise<void> {
  const PricingCollection = connection.models.PricingCollection || connection.model('PricingCollection', PricingCollectionMongoose.schema, 'pricingCollections');

  await PricingCollection.updateMany(
    { description: { $exists: false } }, 
    { $set: { description: "This collection does not have a description" } }
  );

  await PricingCollection.updateMany(
    { private: { $exists: false } },
    { $set: { private: false } }
  );
}

export async function down (connection: Connection): Promise<void> {
  const PricingCollection = connection.models.PricingCollection || connection.model('PricingCollection', PricingCollectionMongoose.schema, 'pricingCollections');
  
  await PricingCollection.updateMany({}, { $unset: { description: "This collection does not have a description", private: "" } });
}
