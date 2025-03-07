// Import your schemas here
import type { Connection } from 'mongoose'
import mongoose from 'mongoose';
import { getMongoDBConnectionURI } from '../../config/mongoose';
import PricingCollectionMongoose from '../../repositories/mongoose/models/PricingCollectionMongoose';

export async function up (connection: Connection): Promise<void> {
  mongoose.connect(getMongoDBConnectionURI());
  
  await PricingCollectionMongoose.updateMany(
    { description: { $exists: false } }, 
    { $set: { description: "This collection does not have a description" } }
  );

  await PricingCollectionMongoose.updateMany(
    { pricing: { $exists: false } },
    { $set: { private: false } }
  );
}

export async function down (connection: Connection): Promise<void> {
  mongoose.connect(getMongoDBConnectionURI());
  
  await PricingCollectionMongoose.updateMany({}, { $unset: { description: "This collection does not have a description", private: "" } });
}
