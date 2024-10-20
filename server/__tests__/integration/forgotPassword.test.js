const request = require("supertest");
const app = require("../../index");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const UserModel = require("../../models/userModel");
const { sendResetEmail } = require("../../utils/email");

jest.mock("../../utils/email");

jest.setTimeout(10000);

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
  jest.clearAllMocks();
});

afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Password Reset Flow", () => {
  describe("POST /api/auth/forgot-password", () => {
    it("should send a password reset link if the email exists", async () => {
      const user = await UserModel.create({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "test@example.com" });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "If an account with that email exists, a password reset link has been sent."
      );

      // Check if sendResetEmail was called with the correct arguments
      expect(sendResetEmail).toHaveBeenCalledWith(
        "test@example.com",
        expect.stringContaining(process.env.FRONTEND_URL)
      );

      // Verify the reset token URL format
      const resetUrl = sendResetEmail.mock.calls[0][1];
      expect(resetUrl).toMatch(
        new RegExp(`^${process.env.FRONTEND_URL}\\?reset_token=[a-f0-9]{40}$`)
      );

      // Check if a reset token was generated for the user
      const updatedUser = await UserModel.findById(user._id);
      expect(updatedUser.resetPasswordToken).toBeDefined();
      expect(updatedUser.resetPasswordExpires).toBeDefined();
    });

    it("should return a success message even if the email does not exist", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@example.com" });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "If an account with that email exists, a password reset link has been sent."
      );
      expect(sendResetEmail).not.toHaveBeenCalled();
    });

    it("should return an error if the email field is empty", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "" });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe("Email is required");
    });
  });

  describe("POST /api/auth/reset-password", () => {
    it("should reset the password with a valid token", async () => {
      const user = await UserModel.create({
        name: "Test User",
        email: "test@example.com",
        password: "oldpassword",
        resetPasswordToken: "validtoken",
        resetPasswordExpires: Date.now() + 3600000, // 1 hour from now
      });

      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: "validtoken",
          newPassword: "newpassword123",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Password has been reset");

      // Verify that the password has been changed
      const updatedUser = await UserModel.findById(user._id);
      expect(await updatedUser.comparePassword("newpassword123")).toBe(true);
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpires).toBeUndefined();
    });

    it("should return an error for an invalid token", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: "invalidtoken",
          newPassword: "newpassword123",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe("Invalid or expired token");
    });

    it("should return an error for an expired token", async () => {
      await UserModel.create({
        name: "Test User",
        email: "test@example.com",
        password: "oldpassword",
        resetPasswordToken: "expiredtoken",
        resetPasswordExpires: Date.now() - 3600000, // 1 hour ago
      });

      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: "expiredtoken",
          newPassword: "newpassword123",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe("Invalid or expired token");
    });
  });
});
