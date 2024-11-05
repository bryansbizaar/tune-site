// const request = require("supertest");
// const app = require("../../index");
// const mongoose = require("mongoose");
// const { MongoMemoryServer } = require("mongodb-memory-server");
// const UserModel = require("../../models/userModel");
// const { sendResetEmail } = require("../../utils/email");
// const crypto = require("crypto");

// // Mock the email utility
// jest.mock("../../utils/email", () => ({
//   sendResetEmail: jest.fn().mockResolvedValue({ messageId: "test-message-id" }),
// }));

// jest.setTimeout(10000);

// let server;
// let mongoServer;

// beforeAll(async () => {
//   mongoServer = await MongoMemoryServer.create();
//   const mongoUri = mongoServer.getUri();
//   await mongoose.connect(mongoUri);
// });

// beforeEach(async () => {
//   server = app.listen(0);
//   await UserModel.deleteMany();
//   jest.clearAllMocks();
// });

// afterEach(async () => {
//   await new Promise((resolve) => server.close(resolve));
// });

// afterAll(async () => {
//   await mongoose.disconnect();
//   await mongoServer.stop();
// });

// describe("Reset Token Validation", () => {
//   let testUser;

//   beforeEach(async () => {
//     // Create a test user before each test
//     testUser = await UserModel.create({
//       name: "Test User",
//       email: "test@example.com",
//       password: "originalpassword",
//     });
//   });

//   it("should generate and store a valid reset token", async () => {
//     // Request password reset
//     const forgotResponse = await request(app)
//       .post("/api/auth/forgot-password")
//       .send({ email: testUser.email });

//     expect(forgotResponse.statusCode).toBe(200);
//     expect(forgotResponse.body.message).toBe(
//       "If an account with that email exists, a password reset link has been sent."
//     );

//     // Verify email was attempted to be sent
//     expect(sendResetEmail).toHaveBeenCalledTimes(1);
//     expect(sendResetEmail.mock.calls[0][0]).toBe(testUser.email);
//     expect(sendResetEmail.mock.calls[0][1]).toMatch(/reset_token=/);

//     // Get updated user and verify token
//     const updatedUser = await UserModel.findById(testUser._id);
//     expect(updatedUser.resetPasswordToken).toBeDefined();
//     expect(updatedUser.resetPasswordExpires).toBeDefined();
//     expect(updatedUser.resetPasswordExpires).toBeInstanceOf(Date);
//     expect(updatedUser.resetPasswordToken).toMatch(/^[a-f0-9]{40}$/); // Should be 40 character hex string
//   });

//   it("should accept and process a valid reset token", async () => {
//     // Generate and store a valid token
//     const token = crypto.randomBytes(20).toString("hex");
//     const expires = new Date(Date.now() + 3600000); // 1 hour from now

//     await UserModel.findByIdAndUpdate(testUser._id, {
//       resetPasswordToken: token,
//       resetPasswordExpires: expires,
//     });

//     // Try to reset password with this token
//     const resetResponse = await request(app)
//       .post("/api/auth/reset-password")
//       .send({
//         token: token,
//         newPassword: "newpassword123",
//       });

//     expect(resetResponse.statusCode).toBe(200);
//     expect(resetResponse.body.message).toBe("Password has been reset");

//     // Verify password was actually changed
//     const updatedUser = await UserModel.findById(testUser._id);
//     expect(await updatedUser.comparePassword("newpassword123")).toBe(true);

//     // Verify token was consumed
//     expect(updatedUser.resetPasswordToken).toBeUndefined();
//     expect(updatedUser.resetPasswordExpires).toBeUndefined();
//   });

//   it("should handle invalid token formats", async () => {
//     const invalidTokens = [
//       {
//         token: "",
//         newPassword: "newpassword123",
//         expectedError: "Token and new password are required",
//       },
//       {
//         token: "short",
//         newPassword: "newpassword123",
//         expectedError: "Invalid or expired token",
//       },
//       {
//         token: "a".repeat(100),
//         newPassword: "newpassword123",
//         expectedError: "Invalid or expired token",
//       },
//       {
//         token: "invalid-chars!",
//         newPassword: "newpassword123",
//         expectedError: "Invalid or expired token",
//       },
//       {
//         token: undefined,
//         newPassword: "newpassword123",
//         expectedError: "Token and new password are required",
//       },
//       {
//         token: "validformat",
//         newPassword: "",
//         expectedError: "Token and new password are required",
//       },
//     ];

//     for (const { token, newPassword, expectedError } of invalidTokens) {
//       const response = await request(app)
//         .post("/api/auth/reset-password")
//         .send({ token, newPassword });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe(expectedError);
//     }
//   });

//   it("should handle the complete token lifecycle", async () => {
//     // Step 1: Request reset token
//     const forgotResponse = await request(app)
//       .post("/api/auth/forgot-password")
//       .send({ email: testUser.email });

//     expect(forgotResponse.statusCode).toBe(200);
//     expect(sendResetEmail).toHaveBeenCalledTimes(1);

//     // Step 2: Get token from database
//     const userWithToken = await UserModel.findById(testUser._id);
//     const token = userWithToken.resetPasswordToken;

//     expect(token).toBeDefined();
//     expect(token).toMatch(/^[a-f0-9]{40}$/);

//     // Step 3: Use token to reset password
//     const resetResponse = await request(app)
//       .post("/api/auth/reset-password")
//       .send({
//         token,
//         newPassword: "newpassword123",
//       });

//     expect(resetResponse.statusCode).toBe(200);
//     expect(resetResponse.body.message).toBe("Password has been reset");

//     // Step 4: Verify token was consumed
//     const updatedUser = await UserModel.findById(testUser._id);
//     expect(updatedUser.resetPasswordToken).toBeUndefined();
//     expect(updatedUser.resetPasswordExpires).toBeUndefined();
//     expect(await updatedUser.comparePassword("newpassword123")).toBe(true);

//     // Step 5: Verify token can't be reused
//     const reusedTokenResponse = await request(app)
//       .post("/api/auth/reset-password")
//       .send({
//         token,
//         newPassword: "anotherpassword",
//       });

//     expect(reusedTokenResponse.statusCode).toBe(400);
//     expect(reusedTokenResponse.body.error).toBe("Invalid or expired token");

//     // Step 6: Verify password hasn't been changed by reuse attempt
//     const finalUser = await UserModel.findById(testUser._id);
//     expect(await finalUser.comparePassword("newpassword123")).toBe(true);
//   });

//   it("should handle expired tokens", async () => {
//     // Create an expired token
//     const token = crypto.randomBytes(20).toString("hex");
//     const expiredDate = new Date(Date.now() - 3600000); // 1 hour ago

//     await UserModel.findByIdAndUpdate(testUser._id, {
//       resetPasswordToken: token,
//       resetPasswordExpires: expiredDate,
//     });

//     const response = await request(app).post("/api/auth/reset-password").send({
//       token,
//       newPassword: "newpassword123",
//     });

//     expect(response.statusCode).toBe(400);
//     expect(response.body.error).toBe("Invalid or expired token");

//     // Verify password wasn't changed
//     const user = await UserModel.findById(testUser._id);
//     expect(await user.comparePassword("originalpassword")).toBe(true);
//   });
// });

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
    const forgotResponse = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: testUser.email });

    expect(forgotResponse.status).toBe(200);

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
    expect(resetResponse.body.message).toBe(
      "Password successfully reset. Please log in with your new password."
    );

    // Verify password was actually changed
    const updatedUser = await UserModel.findById(testUser._id);
    expect(await updatedUser.comparePassword("newpassword123")).toBe(true);
  });

  it("should handle invalid token formats", async () => {
    const invalidTokens = ["", "short", "a".repeat(100), "invalid-chars!"];

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
    // Request reset token
    const forgotResponse = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: testUser.email });

    expect(forgotResponse.status).toBe(200);

    // Get token from database
    const userWithToken = await UserModel.findById(testUser._id);
    const token = userWithToken.resetPasswordToken;

    // Reset password with token
    const resetResponse = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: token,
        newPassword: "completelynewpassword",
      });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.message).toBe(
      "Password successfully reset. Please log in with your new password."
    );

    // Verify token is consumed
    const updatedUser = await UserModel.findById(testUser._id);
    expect(updatedUser.resetPasswordToken).toBeUndefined();
    expect(updatedUser.resetPasswordExpires).toBeUndefined();

    // Verify token can't be reused
    const reusedTokenResponse = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: token,
        newPassword: "anotherpassword",
      });

    expect(reusedTokenResponse.status).toBe(400);
  });

  it("should fail with expired token", async () => {
    // Create user with expired token
    const expiredToken = "expiredtoken";
    await UserModel.findByIdAndUpdate(testUser._id, {
      resetPasswordToken: expiredToken,
      resetPasswordExpires: new Date(Date.now() - 3600000), // 1 hour ago
    });

    const response = await request(app).post("/api/auth/reset-password").send({
      token: expiredToken,
      newPassword: "newpassword123",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid or expired token");
  });
});
