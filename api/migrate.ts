import {getMongoDBConnectionURI} from './src/config/mongoose';

export default {
  uri: getMongoDBConnectionURI(),
  collection: "migrations",
  migrationsPath: "./src/migrations/mongo",
  autosync: true,
};