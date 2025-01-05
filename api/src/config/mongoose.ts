import mongoose, { Mongoose } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config()

const getMongoDBConnectionURI = () => {
  const databaseProtocol = process.env.MONGO_PROTOCOL
  const databaseHost = process.env.MONGO_HOST
  const databasePort = process.env.MONGO_PORT ? `:${process.env.MONGO_PORT}` : ''
  const databaseUsername = process.env.DATABASE_USERNAME
  const databasePassword = process.env.DATABASE_PASSWORD
  const databaseName = process.env.DATABASE_NAME
  const dbCredentials = (databaseUsername && databasePassword) ? databaseUsername + ':' + databasePassword + '@' : ''
  const authSource = databaseProtocol === 'mongodb+srv' ? '' : `?authSource=${databaseName}`
  const mongoDbConnectionURI = `${databaseProtocol}://${dbCredentials}${databaseHost}${databasePort}/${databaseName}${authSource}`
  return mongoDbConnectionURI
}

const initMongoose = () => {
  const mongoDbConnectionURI = getMongoDBConnectionURI()
  console.log(`Trying to connect to ${mongoDbConnectionURI}`)
  mongoose.set('strictQuery', false) // removes a deprecation warning
  // mongoose.set('debug', true)
  return mongoose.connect(mongoDbConnectionURI)
}

const disconnectMongoose = async () => {
  console.log('Disconnecting from MongoDB')
  mongoose.connection.db!.dropDatabase();
  return mongoose.disconnect();
}

export { initMongoose, getMongoDBConnectionURI, disconnectMongoose }
