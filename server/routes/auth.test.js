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

// Import the mock after defining it
const { sendResetEmail } = require("../utils/email");

jest.setTimeout(10000);

app.use(express.json());
app.use("/api/auth", authRoutes);

let server;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  server = app.listen(0);
  await UserModel.deleteMany();
  // Clear mock data before each test
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
      const incompleteUser = {
        name: "testuser",
        email: "testuser@example.com",
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(incompleteUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("All fields are required");
    });

    it("should return 400 if user already exists", async () => {
      const existingUser = {
        name: "existinguser",
        email: "existing@example.com",
        password: "password123",
      };

      // Create a user first
      await request(app).post("/api/auth/signup").send(existingUser);

      // Try to create the same user again
      const response = await request(app)
        .post("/api/auth/signup")
        .send(existingUser);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("User already exists");
    });

    it("should hash the password before saving", async () => {
      const newUser = {
        name: "hashtest",
        email: "hashtest@example.com",
        password: "password123",
      };

      await request(app).post("/api/auth/signup").send(newUser);

      const savedUser = await UserModel.findOne({ email: newUser.email });
      expect(savedUser.password).not.toBe(newUser.password);
      expect(savedUser.password).toHaveLength(60); // bcrypt hash length
    });
  });

  describe("POST /login", () => {
    it("should login successfully with correct credentials", async () => {
      // First, create a user
      const user = {
        name: "testuser",
        email: "testuser@example.com",
        password: "password123",
      };
      await request(app).post("/api/auth/signup").send(user);

      // Now, attempt to login
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({ email: user.email, password: user.password });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.message).toBe("Login successful");
      expect(loginResponse.body.user).toHaveProperty("id");
      expect(loginResponse.body.user.email).toBe(user.email);
      expect(loginResponse.body.user).toHaveProperty("role");
      expect(loginResponse.body).toHaveProperty("token");
    });

    it("should return 401 with incorrect password", async () => {
      // First, create a user
      const user = {
        name: "testuser",
        email: "testuser@example.com",
        password: "password123",
      };
      await request(app).post("/api/auth/signup").send(user);

      // Now, attempt to login with incorrect password
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({ email: user.email, password: "wrongpassword" });

      expect(loginResponse.status).toBe(401);
      expect(loginResponse.body.error).toBe("Invalid email or password");
    });

    it("should return 401 with non-existent email", async () => {
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "anypassword" });

      expect(loginResponse.status).toBe(401);
      expect(loginResponse.body.error).toBe("Invalid email or password");
    });

    it("should return 400 when email is missing", async () => {
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({ password: "anypassword" });

      expect(loginResponse.status).toBe(400);
      expect(loginResponse.body.error).toBe("Email and password are required");
    });

    it("should return 400 when password is missing", async () => {
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com" });

      expect(loginResponse.status).toBe(400);
      expect(loginResponse.body.error).toBe("Email and password are required");
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
    let validToken;

    beforeEach(async () => {
      // Create a user with a valid reset token
      validToken = "validtoken123";
      user = new UserModel({
        name: "Test User",
        email: "test@example.com",
        password: "oldpassword",
        resetPasswordToken: validToken,
        resetPasswordExpires: Date.now() + 3600000, // 1 hour from now
      });
      await user.save();
    });

    it("should reset password with valid token", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: validToken,
          newPassword: "newpassword123",
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Password has been reset");

      // Verify password was changed
      const updatedUser = await UserModel.findById(user._id);
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpires).toBeUndefined();
      expect(await updatedUser.comparePassword("newpassword123")).toBe(true);
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

    it("should fail when token or password is missing", async () => {
      const response1 = await request(app)
        .post("/api/auth/reset-password")
        .send({
          newPassword: "newpassword123",
        });

      expect(response1.status).toBe(400);
      expect(response1.body.error).toBe("Token and new password are required");

      const response2 = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: validToken,
        });

      expect(response2.status).toBe(400);
      expect(response2.body.error).toBe("Token and new password are required");
    });
  });
});
