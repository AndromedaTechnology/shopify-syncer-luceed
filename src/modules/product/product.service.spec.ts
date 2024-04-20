import { Server } from "http";
import supertest from "supertest";
import mongoose, { Mongoose } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { app } from "../../index";
import productService from "./product.service";
import { databaseSetup } from "../../database";

// Server
let server: Server;
let request: supertest.SuperAgentTest;

// Database
let mongoMemoryServer: MongoMemoryServer;
let mongoConnection: Mongoose;

beforeAll(async () => {
  // Server
  server = app.listen();
  request = supertest.agent(server);

  // Database
  mongoMemoryServer = new MongoMemoryServer();
  mongoConnection = await databaseSetup(await mongoMemoryServer.getUri());

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

let itemId: mongoose.Types.ObjectId | undefined;
const variant_sku = "123";
const variant_sku_updated = "345";

describe("message.service", () => {
  it("create", async () => {
    const response = await productService.create({
      variant_sku: variant_sku,
    });

    expect(response).toBeDefined();
    expect(response._id).toBeDefined();
    expect(response.variant_sku).toEqual(variant_sku);

    itemId = response._id;
  });

  it("findAll", async () => {
    const response = await productService.findAll();

    expect(response).toBeDefined();
    expect(response[0].variant_sku).toEqual(variant_sku);
  });

  it("find", async () => {
    const response = await productService.find(itemId!);

    expect(response).toBeDefined();
    expect(response._id).toEqual(itemId);
  });

  it("update", async () => {
    const response = await productService.update(itemId!, undefined, {
      variant_sku: variant_sku_updated,
    });

    expect(response).toBeDefined();
    expect(response._id).toEqual(itemId);
    expect(response.variant_sku).toEqual(variant_sku_updated);
  });

  it("delete", async () => {
    const response = await productService.delete(itemId!);

    expect(response).toBeDefined();
    expect(response._id).toEqual(itemId);
    expect(response.variant_sku).toEqual(variant_sku_updated);
  });
});
