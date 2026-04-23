// deno-lint-ignore-file no-explicit-any
import { createContainer, asValue, asClass, AwilixContainer } from "awilix";
import dotenv from "dotenv";
import process from "node:process";

import MongooseUserRepository from "../repositories/mongoose/UserRepository";
import MongoosePricingRepository from "../repositories/mongoose/PricingRepository";
import MongoosePricingCollectionRepository from "../repositories/mongoose/PricingCollectionRepository";

import UserService from "../services/UserService";
import PricingService from "../services/PricingService";
import PricingCollectionService from "../services/PricingCollectionService";
import CacheService from "../services/CacheService";

dotenv.config();

function initContainer(databaseType: string): AwilixContainer {
  const container: AwilixContainer = createContainer();
  let userRepository, pricingRepository, pricingCollectionRepository;
  switch (databaseType) {
    case "mongoDB":
      userRepository = new MongooseUserRepository();
      pricingRepository = new MongoosePricingRepository();
      pricingCollectionRepository = new MongoosePricingCollectionRepository();
      break;
    default:
      throw new Error(`Unsupported database type: ${databaseType}`);
  }
  container.register({
    userRepository: asValue(userRepository),
    pricingRepository: asValue(pricingRepository),
    pricingCollectionRepository: asValue(pricingCollectionRepository),
    userService: asClass(UserService).singleton(),
    pricingService: asClass(PricingService).singleton(),
    pricingCollectionService: asClass(PricingCollectionService).singleton(),
    cacheService: asClass(CacheService).singleton(),
  });
  return container;
}

let container: AwilixContainer | null = null;
if (!container) { container = initContainer(process.env.DATABASE_TECHNOLOGY ?? "") }

export default container as AwilixContainer;