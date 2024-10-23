const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const authRoutes = require("../routes/auth");
const UserModel = require("../models/userModel");
const { sendResetEmail } = require("../utils/email");

jest.mock("../utils/email");

jest.setTimeout(10000);

app.use(express.json());
app.use("/api/auth", authRoutes);

let server;
let testDbName;

beforeAll(async () => {
  testDbName = "test_auth_" + Math.round(Math.random() * 1000);
  await mongoose.connect(process.env.MONGODB_URI + testDbName);
});

beforeEach(async () => {
  server = app.listen(0);
  await UserModel.deleteMany();
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

// Close the MongoDB connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth Routes - Stay Logged In Tests", () => {
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
      // Create a user
      const user = {
        name: "testuser",
        email: "testuser@example.com",
        password: "password123",
      };
      await request(app).post("/api/auth/signup").send(user);

      // Attempt to login
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
      // Create a user
      const user = {
        name: "testuser",
        email: "testuser@example.com",
        password: "password123",
      };
      await request(app).post("/api/auth/signup").send(user);

      // Attempt to login with incorrect password
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
    it("should set token expiration to 30 days when stayLoggedIn is true", async () => {
      // Create a user
      const user = {
        name: "testuser",
        email: "testuser@example.com",
        password: "password123",
      };
      await request(app).post("/api/auth/signup").send(user);

      // Attempt to login with stayLoggedIn
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: user.email,
        password: user.password,
        stayLoggedIn: true,
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.message).toBe("Login successful");
      expect(loginResponse.body).toHaveProperty("token");
      expect(loginResponse.body.expiresIn).toBe("30d");
    });
    it("should set token expiration to 1 day when stayLoggedIn is false", async () => {
      // Create a user
      const user = {
        name: "testuser",
        email: "testuser@example.com",
        password: "password123",
      };
      await request(app).post("/api/auth/signup").send(user);

      // Attempt to login with stayLoggedIn false
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: user.email,
        password: user.password,
        stayLoggedIn: false,
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.message).toBe("Login successful");
      expect(loginResponse.body).toHaveProperty("token");
      expect(loginResponse.body.expiresIn).toBe("1d");
    });
    it("should default to 1 day expiration when stayLoggedIn is not provided", async () => {
      // Create a user
      const user = {
        name: "testuser",
        email: "testuser@example.com",
        password: "password123",
      };
      await request(app).post("/api/auth/signup").send(user);

      // Attempt to login without stayLoggedIn parameter
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: user.email,
        password: user.password,
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.message).toBe("Login successful");
      expect(loginResponse.body).toHaveProperty("token");
      expect(loginResponse.body.expiresIn).toBe("1d");
    });
  });

  describe("POST /forgot-password", () => {
    it("should send a password reset email for a valid user", async () => {
      const user = new UserModel({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });
      await user.save();

      sendResetEmail.mockResolvedValue({ messageId: "test-message-id" });

      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "If an account with that email exists, a password reset link has been sent."
      );
      expect(sendResetEmail).toHaveBeenCalledWith(
        "test@example.com",
        expect.stringContaining("reset_token=")
      );
    });

    it("should return 200 with generic message for non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@example.com" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "If an account with that email exists, a password reset link has been sent."
      );
    });

    it("should return 400 when email is missing", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Email is required");
    });
  });

  describe("POST /reset-password", () => {
    it("should reset password with valid token", async () => {
      const user = new UserModel({
        name: "Test User",
        email: "test@example.com",
        password: "oldpassword",
        resetPasswordToken: "validtoken",
        resetPasswordExpires: Date.now() + 3600000, // 1 hour from now
      });
      await user.save();

      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "validtoken", newPassword: "newpassword123" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Password has been reset");

      const updatedUser = await UserModel.findById(user._id);
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpires).toBeUndefined();
      expect(await updatedUser.comparePassword("newpassword123")).toBe(true);
    });

    it("should return 400 for invalid or expired token", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "invalidtoken", newPassword: "newpassword123" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid or expired token");
    });

    it("should return 400 when token or new password is missing", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "validtoken" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid or expired token");
    });
  });
});
