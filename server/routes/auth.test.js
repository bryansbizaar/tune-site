const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const UserModel = require("../models/userModel");
const express = require("express");
const app = express();
const authRoutes = require("../routes/auth");

// Mock the email module
jest.mock("../utils/email", () => ({
  sendResetEmail: jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve({ messageId: "test-message-id" })
    ),
}));

// Import the mocked module
const { sendResetEmail } = require("../utils/email");

jest.setTimeout(10000);

// Setup express app
app.use(express.json());
app.use("/api/auth", authRoutes);

let mongoServer;
let server;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  server = app.listen(0);
  await UserModel.deleteMany({});
  jest.clearAllMocks();
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Auth Routes", () => {
  describe("POST /signup", () => {
    it("should create a new user and return 201", async () => {
      const newUser = {
        name: "testuser",
        email: "testuser@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User created successfully");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user.name).toBe(newUser.name);
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user.role).toBe("user");
      expect(response.body).toHaveProperty("token");
    });

    it("should return 400 if required fields are missing", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({ name: "testuser", email: "test@example.com" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("All fields are required");
    });

    it("should return 400 if user already exists", async () => {
      const existingUser = {
        name: "existinguser",
        email: "existing@example.com",
        password: "password123",
      };

      // Create user first
      await request(app).post("/api/auth/signup").send(existingUser);

      // Try to create same user again
      const response = await request(app)
        .post("/api/auth/signup")
        .send(existingUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("User already exists");
    });
  });

  describe("POST /login", () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app).post("/api/auth/signup").send({
        name: "testuser",
        email: "testuser@example.com",
        password: "password123",
      });
    });

    it("should login successfully with correct credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "testuser@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.token).toBeDefined();
    });

    it("should return 401 with incorrect password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "testuser@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid email or password");
    });

    it("should set token expiration to 30 days when stayLoggedIn is true", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "testuser@example.com",
        password: "password123",
        stayLoggedIn: true,
      });

      expect(response.status).toBe(200);
      expect(response.body.expiresIn).toBe("30d");
    });

    it("should set token expiration to 1 day when stayLoggedIn is false", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "testuser@example.com",
        password: "password123",
        stayLoggedIn: false,
      });

      expect(response.status).toBe(200);
      expect(response.body.expiresIn).toBe("1d");
    });
  });

  describe("POST /forgot-password", () => {
    it("should send reset email for valid user", async () => {
      // Create a user first
      const user = await UserModel.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(200);
      expect(sendResetEmail).toHaveBeenCalled();

      // Verify reset token was set
      const updatedUser = await UserModel.findById(user._id);
      expect(updatedUser.resetPasswordToken).toBeDefined();
    });

    it("should return same response for non-existent email", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "If an account with that email exists, a password reset link has been sent."
      );
      expect(sendResetEmail).not.toHaveBeenCalled();
    });
  });

  describe("POST /reset-password", () => {
    let user;
    let resetToken;

    beforeEach(async () => {
      // Create a user with a reset token
      user = await UserModel.create({
        name: "Test User",
        email: "test@example.com",
        password: "oldpassword",
        resetPasswordToken: "validtoken",
        resetPasswordExpires: Date.now() + 3600000, // 1 hour from now
      });
      resetToken = "validtoken";
    });

    it("should reset password with valid token", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: resetToken,
          newPassword: "newpassword123",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Password has been reset");

      // Verify password was changed
      const updatedUser = await UserModel.findById(user._id);
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpires).toBeUndefined();
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: "invalidtoken",
          newPassword: "newpassword123",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid or expired token");
    });
  });
});
