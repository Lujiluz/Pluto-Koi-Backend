const mongoose = require("mongoose");

module.exports = async () => {
  // Close mongoose connection
  await mongoose.connection.close();

  // Stop mongo server
  if (global.__MONGOINSTANCE__) {
    await global.__MONGOINSTANCE__.stop();
  }
};
