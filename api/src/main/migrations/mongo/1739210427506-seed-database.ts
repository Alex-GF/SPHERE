import type { Connection } from 'mongoose'
import { Seeder } from 'mongo-seeding'
import { getMongoDBConnectionURI } from '../../config/mongoose'
import path from 'path'

async function dropDatabaseButNoMigrations(connection: Connection){
  const collections = await connection.db!.listCollections().toArray()
  
  for (const collection of collections) {
    if (collection.name !== 'migrations') {
      await connection.db!.dropCollection(collection.name)
    }
  }
}

export async function up (connection: Connection): Promise<void> {
  
  await dropDatabaseButNoMigrations(connection)

  const config = {
    database: getMongoDBConnectionURI(),
  }
  
  const seeder = new Seeder(config)
  
  const collections = seeder.readCollectionsFromPath(path.resolve("./src/database/seeders/mongo/"))
  
    try {
      await seeder.import(collections)
      console.log('==== Mongo seeding successfull ====')
    } catch (err) {
      console.error(`Seeding error: ${err}`)
    }
  
}

export async function down (connection: Connection): Promise<void> {
  await dropDatabaseButNoMigrations(connection);
}
