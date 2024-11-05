const mongoose = require("mongoose");

const connectDB = async () => {
  // try {
  //   await mongoose.connect(process.env.MONGODB_URI);
  //   console.log("Connected to MongoDB successfully");
  // } catch (error) {
  //   console.error("MongoDB connection error:", error);
  //   process.exit(1);
  // }
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
