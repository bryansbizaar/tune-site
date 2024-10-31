// const request = require("supertest");
// const app = require("../../index");
// const mongoose = require("mongoose");
// const { MongoMemoryServer } = require("mongodb-memory-server");
// const UserModel = require("../../models/userModel");
// const { sendResetEmail } = require("../../utils/email");

// jest.mock("../../utils/email");

// jest.setTimeout(10000);

// let server;
// let mongoServer;

// beforeAll(async () => {
//   mongoServer = await MongoMemoryServer.create();
//   const mongoUri = mongoServer.getUri();
//   await mongoose.connect(mongoUri, {});
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

// describe("Password Reset Flow", () => {
//   describe("POST /api/auth/forgot-password", () => {
//     it("should send a password reset link if the email exists", async () => {
//       const user = await UserModel.create({
//         name: "Test User",
//         email: "test@example.com",
//         password: "password123",
//       });

//       const response = await request(app)
//         .post("/api/auth/forgot-password")
//         .send({ email: "test@example.com" });

//       expect(response.statusCode).toBe(200);
//       expect(response.body.message).toBe(
//         "If an account with that email exists, a password reset link has been sent."
//       );

//       // Check if sendResetEmail was called with the correct arguments
//       expect(sendResetEmail).toHaveBeenCalledWith(
//         "test@example.com",
//         expect.stringContaining(process.env.FRONTEND_URL)
//       );

//       // Verify the reset token URL format
//       const resetUrl = sendResetEmail.mock.calls[0][1];
//       expect(resetUrl).toMatch(
//         new RegExp(`^${process.env.FRONTEND_URL}\\?reset_token=[a-f0-9]{40}$`)
//       );

//       // Check if a reset token was generated for the user
//       const updatedUser = await UserModel.findById(user._id);
//       expect(updatedUser.resetPasswordToken).toBeDefined();
//       expect(updatedUser.resetPasswordExpires).toBeDefined();
//     });

//     it("should return a success message even if the email does not exist", async () => {
//       const response = await request(app)
//         .post("/api/auth/forgot-password")
//         .send({ email: "nonexistent@example.com" });

//       expect(response.statusCode).toBe(200);
//       expect(response.body.message).toBe(
//         "If an account with that email exists, a password reset link has been sent."
//       );
//       expect(sendResetEmail).not.toHaveBeenCalled();
//     });

//     it("should return an error if the email field is empty", async () => {
//       const response = await request(app)
//         .post("/api/auth/forgot-password")
//         .send({ email: "" });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("Email is required");
//     });
//   });

//   describe("POST /api/auth/reset-password", () => {
//     it("should reset the password with a valid token", async () => {
//       const user = await UserModel.create({
//         name: "Test User",
//         email: "test@example.com",
//         password: "oldpassword",
//         resetPasswordToken: "validtoken",
//         resetPasswordExpires: Date.now() + 3600000, // 1 hour from now
//       });

//       const response = await request(app)
//         .post("/api/auth/reset-password")
//         .send({
//           token: "validtoken",
//           newPassword: "newpassword123",
//         });

//       expect(response.statusCode).toBe(200);
//       expect(response.body.message).toBe("Password has been reset");

//       // Verify that the password has been changed
//       const updatedUser = await UserModel.findById(user._id);
//       expect(await updatedUser.comparePassword("newpassword123")).toBe(true);
//       expect(updatedUser.resetPasswordToken).toBeUndefined();
//       expect(updatedUser.resetPasswordExpires).toBeUndefined();
//     });

//     it("should return an error for an invalid token", async () => {
//       const response = await request(app)
//         .post("/api/auth/reset-password")
//         .send({
//           token: "invalidtoken",
//           newPassword: "newpassword123",
//         });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("Invalid or expired token");
//     });

//     it("should return an error for an expired token", async () => {
//       await UserModel.create({
//         name: "Test User",
//         email: "test@example.com",
//         password: "oldpassword",
//         resetPasswordToken: "expiredtoken",
//         resetPasswordExpires: Date.now() - 3600000, // 1 hour ago
//       });

//       const response = await request(app)
//         .post("/api/auth/reset-password")
//         .send({
//           token: "expiredtoken",
//           newPassword: "newpassword123",
//         });

//       expect(response.statusCode).toBe(400);
//       expect(response.body.error).toBe("Invalid or expired token");
//     });
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

describe("Password Reset Flow", () => {
  describe("Forgot Password Request", () => {
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

      // Verify sendResetEmail was called
      expect(sendResetEmail).toHaveBeenCalledWith(
        "test@example.com",
        expect.stringContaining(process.env.FRONTEND_URL)
      );

      // Verify user was updated with reset token
      const updatedUser = await UserModel.findById(user._id);
      expect(updatedUser.resetPasswordToken).toBeDefined();
      expect(updatedUser.resetPasswordExpires).toBeDefined();
    });

    it("should return success message even if email does not exist", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "nonexistent@example.com" });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "If an account with that email exists, a password reset link has been sent."
      );
      expect(sendResetEmail).not.toHaveBeenCalled();
    });

    it("should return error if email is missing", async () => {
      const response = await request(app)
        .post("/api/auth/forgot-password")
        .send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe("Email is required");
    });
  });

  describe("Password Reset", () => {
    let user;
    let resetToken;

    beforeEach(async () => {
      // Create a user and generate reset token
      user = await UserModel.create({
        name: "Test User",
        email: "test@example.com",
        password: "oldpassword",
      });

      // Request password reset to generate token
      await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: "test@example.com" });

      // Get the token from the updated user
      const updatedUser = await UserModel.findById(user._id);
      resetToken = updatedUser.resetPasswordToken;
    });

    it("should successfully reset password with valid token", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: resetToken,
          newPassword: "newpassword123",
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Password has been reset");

      // Verify password was changed
      const updatedUser = await UserModel.findById(user._id);
      expect(await updatedUser.comparePassword("newpassword123")).toBe(true);
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpires).toBeUndefined();

      // Verify can login with new password
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "newpassword123",
      });

      expect(loginResponse.statusCode).toBe(200);
      expect(loginResponse.body.token).toBeDefined();
    });

    it("should fail to reset password with invalid token", async () => {
      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: "invalidtoken",
          newPassword: "newpassword123",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe("Invalid or expired token");
    });

    it("should fail to reset password with expired token", async () => {
      // Update the reset token to be expired
      await UserModel.findByIdAndUpdate(user._id, {
        resetPasswordExpires: new Date(Date.now() - 3600000), // 1 hour ago
      });

      const response = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: resetToken,
          newPassword: "newpassword123",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe("Invalid or expired token");
    });

    it("should verify the complete password reset flow", async () => {
      // 1. Request password reset
      const forgotResponse = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: user.email });

      expect(forgotResponse.statusCode).toBe(200);

      // 2. Get the new reset token
      const userAfterRequest = await UserModel.findById(user._id);
      const newResetToken = userAfterRequest.resetPasswordToken;

      // 3. Reset password
      const resetResponse = await request(app)
        .post("/api/auth/reset-password")
        .send({
          token: newResetToken,
          newPassword: "completelynewpassword",
        });

      expect(resetResponse.statusCode).toBe(200);

      // 4. Try logging in with new password
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: user.email,
        password: "completelynewpassword",
      });

      expect(loginResponse.statusCode).toBe(200);
      expect(loginResponse.body.token).toBeDefined();
    });
  });
});
