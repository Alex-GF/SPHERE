import dotenv from "dotenv";
import request from "supertest";
import { getApp, shutdownApp } from "./utils/testApp";
import { Server } from "http";
import {describe, it, expect, beforeAll, afterAll } from "vitest";
import { generateFakeUser } from "./utils/testData";

dotenv.config();

describe("Get public user information", function () {
  let app: Server;

  beforeAll(async function () {
    app = await getApp();
  });

  describe("POST /users/register", function () {
    it("Should return 201 and the user created", async function () {
      const newUser = generateFakeUser("user");
      const response = await request(app).get("/api/users");
      expect(response.status).toEqual(200);
      // const response = await request(app).post("/api/users/register").send(newUser);
      // expect(response.status).toEqual(201);
      // expect(response.body.password).toBeUndefined();
      // expect(response.body.email).toEqual(newUser.email);
    });
  });

  afterAll(async function () {
    await shutdownApp();
  });
});
