import { Seeder } from 'mongo-seeding';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMongoDBConnectionURI } from '../../../config/mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  database: getMongoDBConnectionURI(),
  dropDatabase: true
};

const seeder = new Seeder(config);

const collections = seeder.readCollectionsFromPath(path.resolve(__dirname));

export const seedDatabase = async () => {
  try {
    await seeder.import(collections);
    console.log('==== Mongo seeding successfull ====');
  } catch (err) {
    console.error(`Seeding error: ${err}`);
  }
};
