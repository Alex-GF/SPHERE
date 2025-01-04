import dotenv from "dotenv";
import request from "supertest";
import { getApp, shutdownApp } from "./utils/testApp";
import { Server } from "http";
import {describe, it, expect, beforeAll, afterAll } from "vitest";

dotenv.config();

describe("Get public user information", function () {
  let app: Server;

  beforeAll(async function () {
    app = await getApp();
  });

  describe("POST /users/register", function () {
    
  });

  // it("Should return 200 and the list of current users in the database", async function () {
  //   const response = await request(app).get("/users");
  //   expect(response.status).toEqual(200);
  //   expect(response.body.length > 0).toBeTruthy();
  // });

  afterAll(async function () {
    await shutdownApp();
  });
});
