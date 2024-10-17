import dotenv from "dotenv";
import request from "supertest";
import { getApp, shutdownApp } from "./utils/testApp.ts";
import { describe, it, beforeAll, afterAll } from "jsr:@std/testing/bdd";
import type { Server } from "node:http";
import { assertEquals, assert } from "jsr:@std/assert";

dotenv.config();

describe("Get public user information", () => {
  let app: Server;

  beforeAll(async () => {
    app = await getApp();
  });

  it("Should return 200 and the list of current users in the database", async () => {
    const response = await request(app).get("/users");
    if (response.status !== 200) {
      console.error(response.body);
    }
    assertEquals(response.status, 200);
    assert(response.body.length > 0);
  });

  afterAll(async () => {
    await shutdownApp();
  });
});
