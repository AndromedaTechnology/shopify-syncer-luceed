import { Server } from "http";
import supertest from "supertest";
import mongoose, { Mongoose } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { app } from "../../index";
import messageService from "./message.service";
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
const content = "Inspired";
const contentUpdated = "Tenacious";

describe("message.service", () => {
  it("create", async () => {
    const response = await messageService.create({
      content: content,
    });

    expect(response).toBeDefined();
    expect(response._id).toBeDefined();
    expect(response.content).toEqual(content);

    itemId = response._id;
  });

  it("findAll", async () => {
    const response = await messageService.findAll();

    expect(response).toBeDefined();
    expect(response[0].content).toEqual(content);
  });

  it("find", async () => {
    const response = await messageService.find(itemId!);

    expect(response).toBeDefined();
    expect(response._id).toEqual(itemId);
  });

  it("update", async () => {
    const response = await messageService.update(itemId!, {
      content: contentUpdated,
    });

    expect(response).toBeDefined();
    expect(response._id).toEqual(itemId);
    expect(response.content).toEqual(contentUpdated);
  });

  it("delete", async () => {
    const response = await messageService.delete(itemId!);

    expect(response).toBeDefined();
    expect(response._id).toEqual(itemId);
    expect(response.content).toEqual(contentUpdated);
  });
});
