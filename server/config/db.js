const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    throw new Error(`Error connecting to MongoDB: ${error.message}`);
  }
};

module.exports = connectDB;
