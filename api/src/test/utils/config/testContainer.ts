// deno-lint-ignore-file no-explicit-any
import { createContainer, asValue, AwilixContainer } from "awilix";
import dotenv from "dotenv";
import { getApp } from "../testApp";

dotenv.config();

async function initTestContainer(): Promise<AwilixContainer> {
  const container: AwilixContainer = createContainer();
  container.register({
    app: asValue(await getApp()),
    usersToDelete: asValue(new Set<string>()),
    generatedFilesToDelete: asValue(new Set<string>()),
    collectionIdsToDelete: asValue(new Set<string>()),
  });
  return container;
}

let container: AwilixContainer | null = null;
if (!container) { container = await initTestContainer(); }

export default container as AwilixContainer;