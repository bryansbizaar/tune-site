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

describe("Reset Token Validation", () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user
    testUser = await UserModel.create({
      name: "Test User",
      email: "test@example.com",
      password: "originalpassword",
    });
  });

  it("should generate and store a valid reset token", async () => {
    // Request password reset
    const forgotResponse = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: testUser.email });

    expect(forgotResponse.status).toBe(200);

    // Get updated user and verify token
    const updatedUser = await UserModel.findById(testUser._id);
    expect(updatedUser.resetPasswordToken).toBeDefined();
    expect(typeof updatedUser.resetPasswordToken).toBe("string");
    expect(updatedUser.resetPasswordToken.length).toBeGreaterThan(0);

    console.log("Generated token details:", {
      length: updatedUser.resetPasswordToken.length,
      start: updatedUser.resetPasswordToken.substring(0, 10),
      end: updatedUser.resetPasswordToken.substring(
        updatedUser.resetPasswordToken.length - 10
      ),
    });
  });

  it("should accept and process a valid reset token", async () => {
    // First generate a token
    await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: testUser.email });

    const userWithToken = await UserModel.findById(testUser._id);
    const token = userWithToken.resetPasswordToken;

    // Try to reset password with this token
    const resetResponse = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: token,
        newPassword: "newpassword123",
      });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.message).toBe("Password has been reset");

    // Verify password was actually changed
    const updatedUser = await UserModel.findById(testUser._id);
    expect(await updatedUser.comparePassword("newpassword123")).toBe(true);
  });

  it("should handle invalid token formats", async () => {
    const invalidTokens = [
      "",
      "short",
      "a".repeat(100), // too long
      "invalid-chars!", // invalid characters
    ];

    for (const invalidToken of invalidTokens) {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: invalidToken,
          newPassword: "newpassword123",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    }
  });

  it("should handle the complete token lifecycle", async () => {
    // 1. Request reset token
    const forgotResponse = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: testUser.email });

    expect(forgotResponse.status).toBe(200);

    // 2. Get token from database
    const userWithToken = await UserModel.findById(testUser._id);
    const token = userWithToken.resetPasswordToken;

    console.log("Token lifecycle test - token details:", {
      exists: !!token,
      length: token?.length,
    });

    // 3. Try using token
    const resetResponse = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: token,
        newPassword: "newpassword123",
      });

    expect(resetResponse.status).toBe(200);

    // 4. Verify token was consumed
    const updatedUser = await UserModel.findById(testUser._id);
    expect(updatedUser.resetPasswordToken).toBeUndefined();
    expect(updatedUser.resetPasswordExpires).toBeUndefined();

    // 5. Verify token can't be reused
    const reusedTokenResponse = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: token,
        newPassword: "anotherpassword",
      });

    expect(reusedTokenResponse.status).toBe(400);
  });
});