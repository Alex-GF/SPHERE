// deno-lint-ignore-file no-explicit-any
import { createContainer, asValue, asClass, AwilixContainer } from "awilix";
import dotenv from "dotenv";
import process from "node:process";

import UserMockDB from "../repositories/mockDB/UserMockDB";

import UserService from "../services/UserService";

dotenv.config();

function initContainer(databaseType: string): AwilixContainer {
  const container: AwilixContainer = createContainer();
  let userRepository;
  switch (databaseType) {
    case "mockDB":
      userRepository = new UserMockDB();
      break;
    default:
      throw new Error(`Unsupported database type: ${databaseType}`);
  }
  container.register({
    userRepository: asValue(userRepository),
    userService: asClass(UserService).singleton(),
  });
  return container;
}

let container: AwilixContainer | null = null;
if (!container) { container = initContainer(process.env.DATABASE_TECHNOLOGY ?? "") }

export default container as AwilixContainer;