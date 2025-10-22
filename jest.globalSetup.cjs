const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongoServer;

module.exports = async () => {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Store for global teardown
  global.__MONGOINSTANCE__ = mongoServer;
  process.env.MONGO_URI = mongoUri;
};
