import type { Connection } from 'mongoose';
import { Seeder } from 'mongo-seeding';
import { getMongoDBConnectionURI } from '../../config/mongoose';
import path from 'path';

async function dropDatabase(connection: Connection) {
  const collections = await connection.db!.listCollections().toArray();

  for (const collection of collections) {
    await connection.db!.dropCollection(collection.name);
  }
}

export async function up(connection: Connection): Promise<void> {
  if (process.env.ENVIRONMENT === 'development') {
    const config = {
      database: getMongoDBConnectionURI(),
    };

    const seeder = new Seeder(config);

    const collections = seeder.readCollectionsFromPath(
      path.resolve('./src/main/database/seeders/mongo/')
    );

    try {
      await seeder.import(collections);
      console.log('==== Mongo seeding successfull ====');
    } catch (err) {
      console.error(`Seeding error: ${err}`);
    }
  }
}

export async function down(connection: Connection): Promise<void> {
  await dropDatabase(connection);
}
