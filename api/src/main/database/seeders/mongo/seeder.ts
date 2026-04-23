import { Seeder } from 'mongo-seeding'
import path from 'path'
import { fileURLToPath } from 'url'
// import fs from 'fs'
import { getMongoDBConnectionURI } from '../../../config/mongoose'

// const copyFiles = () => {
//   const originDir = 'public/example_assets/'
//   const restaurantDestinationDir = process.env.RESTAURANTS_FOLDER + '/'
//   if (!fs.existsSync(restaurantDestinationDir)) {
//     fs.mkdirSync(restaurantDestinationDir, { recursive: true })
//   }
//   const productDestinationDir = process.env.PRODUCTS_FOLDER + '/'
//   if (!fs.existsSync(productDestinationDir)) {
//     fs.mkdirSync(productDestinationDir, { recursive: true })
//   }
//   const productsFilenames = ['aceitunas.jpeg', 'agua.png', 'applePie.jpeg', 'burritos.jpeg', 'cafe.jpeg', 'cerveza.jpeg', 'chocolateCake.jpeg', 'chocolateIceCream.jpeg', 'churros.jpeg', 'cola.jpeg', 'ensaladilla.jpeg', 'femaleAvatar.png', 'grilledTuna.jpeg', 'heroImage.jpg', 'logo.jpeg', 'maleAvatar.png', 'montaditoChocolate.png', 'montaditoJamon.jpeg', 'montaditoQuesoTomate.jpeg', 'montaditoSalmon.jpeg', 'muffin.jpeg', 'paella.jpeg', 'salchichon.jpeg', 'steak.jpeg']
//   const restaurantsFilenames = ['mañanaRestaurantLogo.png', 'mañanaRestaurantHero.jpeg', '100MontaditosHero.jpeg', '100MontaditosLogo.jpeg']
//   productsFilenames.forEach(productFilename => {
//     fs.copyFile(originDir + productFilename, productDestinationDir + productFilename, (err) => {
//       if (err) throw err
//     })
//   })
//   restaurantsFilenames.forEach(resturantFilename => {
//     fs.copyFile(originDir + resturantFilename, restaurantDestinationDir + resturantFilename, (err) => {
//       if (err) throw err
//     })
//   })
// }

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config = {
  database: getMongoDBConnectionURI(),
  dropDatabase: true
}

const seeder = new Seeder(config)

const collections = seeder.readCollectionsFromPath(path.resolve(__dirname))

export const seedDatabase = async () => {
  try {
    await seeder.import(collections)
    console.log('==== Mongo seeding successfull ====')
  } catch (err) {
    console.error(`Seeding error: ${err}`)
  }
}
