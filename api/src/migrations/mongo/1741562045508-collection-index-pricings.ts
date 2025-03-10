// Import your schemas here
import type { Connection } from 'mongoose'
import mongoose from 'mongoose';
import { getMongoDBConnectionURI } from '../../config/mongoose';

export async function up (connection: Connection): Promise<void> {
  mongoose.connect(getMongoDBConnectionURI());

  const collection = connection.collection('pricings');

  // Remove the existing index
  const indexes = await collection.indexes();
  const oldIndexExists = indexes.some(index => index.name === 'name_1_version_1_owner_1');
  if (oldIndexExists) {
    await collection.dropIndex('name_1_version_1_owner_1');
  }

  // Create the new index
  const newIndexExists = indexes.some(index => index.name === 'name_1_owner_1_version_1__collectionId_1');
  if (!newIndexExists) {
    await collection.createIndex({ name: 1, owner: 1, version: 1, _collectionId: 1 });
  }
}

export async function down (connection: Connection): Promise<void> {
  mongoose.connect(getMongoDBConnectionURI());

  const collection = connection.collection('pricings');
  const indexes = await collection.indexes();
  
  // Remove the existing index
  const oldIndexExists = indexes.some(index => index.name === 'name_1_owner_1_version_1__collectionId_1');
  if (oldIndexExists) {
    await collection.dropIndex('name_1_owner_1_version_1__collectionId_1');
  }

  const newIndexExists = indexes.some(index => index.name === 'name_1_version_1_owner_1');
  if (!newIndexExists) {
    await collection.createIndex({ name: 1, owner: 1, version: 1 });
  }
}
