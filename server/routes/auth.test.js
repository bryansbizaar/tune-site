const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const app = express();
const authRoutes = require("../routes/auth");
const UserModel = require("../models/userModel");

jest.setTimeout(10000); // Set timeout to 10 seconds

app.use(express.json());
app.use("/api/auth", authRoutes);

let server;

// Ensure MongoDB is connected before running tests
beforeAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100)); // Add a small delay
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Start server and clean up database before each test
beforeEach(async () => {
  server = app.listen();
  await UserModel.deleteMany(); // Clear users before each test
});

// Close server after each test
afterEach(async () => {
  if (server && server.close) {
    await server.close();
  }
});

// Close the MongoDB connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe("POST /signup", () => {
  it("should create a new user and return 201", async () => {
    const newUser = {
      username: "testuser",
      email: "testuser@example.com",
      password: "password123",
    };

    const response = await request(app).post("/api/auth/signup").send(newUser);

    // Expect a successful creation of the user
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User created successfully");
  });
});
