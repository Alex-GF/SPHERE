// Import your schemas here
import type { Connection } from 'mongoose'
import PricingMongoose from '../../repositories/mongoose/models/PricingMongoose';
import mongoose from 'mongoose';
import { getMongoDBConnectionURI } from '../../config/mongoose';

export async function up (connection: Connection): Promise<void> {
  mongoose.connect(getMongoDBConnectionURI());
  
  await PricingMongoose.updateMany({}, { private: false });
}

export async function down (connection: Connection): Promise<void> {
  mongoose.connect(getMongoDBConnectionURI());
  
  await PricingMongoose.updateMany({}, { $unset: { private: "" } });
}
