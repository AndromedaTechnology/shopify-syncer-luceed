import { Server } from "http";
import supertest from "supertest";
import { Mongoose } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import config from "../../config";
import { app } from "../../index";
import { databaseSetup } from "../../database";
import authService from "../auth/auth.service";

// Server
let server: Server;
let request: supertest.SuperAgentTest;

// Database
let mongoMemoryServer: MongoMemoryServer;
let mongoConnection: Mongoose;

// Token
let token: string;

beforeAll(async () => {
  // Server
  server = app.listen();
  request = supertest.agent(server);

  // Database
  mongoMemoryServer = new MongoMemoryServer();
  mongoConnection = await databaseSetup(await mongoMemoryServer.getUri());

  token = authService.getToken(config.admin_password);

  return Promise.resolve();
});

afterAll(async () => {
  // Server
  server.close();

  // Database
  await mongoConnection.disconnect();
  await mongoMemoryServer.stop();

  return Promise.resolve();
});

let itemId: string;
const itemContent = "Inspired";
const itemContentUpdated = "Tenacious";

const responseType = "application/json";

describe("product.routes", () => {
  it("create", async () => {
    const response = await request
      .post(config.api_prefix + "/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: itemContent,
      });

    expect(response.status).toEqual(200);
    expect(response.type).toEqual(responseType);
    expect(response.body).toBeDefined();
    expect(response.body._id).toBeDefined();
    expect(response.body.content).toEqual(itemContent);

    itemId = response.body._id;
  });

  it("findAll", async () => {
    const response = await request.get(config.api_prefix + "/products");

    expect(response.status).toEqual(200);
    expect(response.type).toEqual(responseType);
    expect(response.body).toBeDefined();
    expect(response.body[0].content).toEqual(itemContent);
  });

  it("find", async () => {
    const response = await request.get(
      config.api_prefix + `/products/${itemId}`
    );

    expect(response.status).toEqual(200);
    expect(response.type).toEqual(responseType);
    expect(response.body).toBeDefined();
    expect(response.body._id).toEqual(itemId);
  });

  it("update", async () => {
    const response = await request
      .patch(config.api_prefix + `/products/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: itemContentUpdated,
      });

    expect(response.status).toEqual(200);
    expect(response.type).toEqual(responseType);
    expect(response.body).toBeDefined();
    expect(response.body._id).toEqual(itemId);
    expect(response.body.content).toEqual(itemContentUpdated);
  });

  it("delete", async () => {
    const response = await request
      .delete(config.api_prefix + `/products/${itemId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toEqual(200);
    expect(response.type).toEqual(responseType);
    expect(response.body).toBeDefined();
    expect(response.body._id).toEqual(itemId);
    expect(response.body.content).toEqual(itemContentUpdated);
  });
});
