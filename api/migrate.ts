import { getMongoDBConnectionURI } from './src/main/config/mongoose';

export default {
  uri: getMongoDBConnectionURI(),
  collection: "migrations",
  migrationsPath: "./src/main/migrations/mongo",
  autosync: true,
};
