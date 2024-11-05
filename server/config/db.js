const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log(
        "Connected to MongoDB:",
        process.env.MONGODB_URI.includes("mongodb+srv") ? "Atlas" : "Local"
      );
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
};

module.exports = connectDB;
