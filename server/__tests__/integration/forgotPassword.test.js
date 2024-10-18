// const request = require("supertest");
// const mongoose = require("mongoose");
// const app = require("../../index"); // Your app's main file
// const UserModel = require("../../models/userModel");
// const { sendResetEmail } = require("../../utils/email");
// const authRoutes = require("../../routes/auth");
// const express = require("express");

// jest.mock("../../utils/email");

// jest.setTimeout(30000); // Set timeout for all tests in this file to 30 seconds

// // Express app setup for integration testing
// app.use(express.json());
// app.use("/api/auth", authRoutes);

// let server;

// // Ensure MongoDB is connected before running tests
// beforeAll(async () => {
//   await mongoose.connect(process.env.MONGODB_URI);
// });

// // Start the server and clean up database before each test
// beforeEach(async () => {
//   server = app.listen(4000); // Specify a port to avoid conflicts
//   await UserModel.deleteMany({}); // Clear users before each test
// });

// // Close the server after each test to ensure no open handles
// afterEach(async () => {
//   if (server && server.close) {
//     await server.close();
//   }
// });

// // Close the MongoDB connection after all tests
// afterAll(async () => {
//   await mongoose.connection.close();
// });

// describe("Forgot Password Flow (Server)", () => {
//   it("should complete the entire forgot password flow", async () => {
//     // Create a user
//     const user = new UserModel({
//       name: "Test User",
//       email: "test@example.com",
//       password: "oldpassword",
//     });
//     await user.save();

//     // Request password reset
//     const forgotResponse = await request(app)
//       .post("/api/auth/forgot-password")
//       .send({ email: "test@example.com" });
//     expect(forgotResponse.statusCode).toBe(200);
//     expect(sendResetEmail).toHaveBeenCalled();

//     // Get the reset token (in a real scenario, this would be sent via email)
//     const updatedUser = await UserModel.findOne({ email: "test@example.com" });
//     const resetToken = updatedUser.resetPasswordToken;
//     expect(resetToken).toBeDefined(); // Ensure token is created

//     // Reset the password
//     const resetResponse = await request(app)
//       .post("/api/auth/reset-password")
//       .send({ token: resetToken, newPassword: "newpassword123" });
//     expect(resetResponse.statusCode).toBe(200);

//     // Check that resetPasswordToken is cleared
//     const finalUser = await UserModel.findOne({ email: "test@example.com" });
//     expect(finalUser.resetPasswordToken).toBeUndefined();

//     // Try logging in with the new password
//     const loginResponse = await request(app)
//       .post("/api/auth/login")
//       .send({ email: "test@example.com", password: "newpassword123" });
//     expect(loginResponse.statusCode).toBe(200);
//     expect(loginResponse.body).toHaveProperty("token");

//     // Verify that the old password no longer works
//     const oldPasswordLoginResponse = await request(app)
//       .post("/api/auth/login")
//       .send({ email: "test@example.com", password: "oldpassword" });
//     expect(oldPasswordLoginResponse.statusCode).toBe(401);
//   });
// });

// const request = require("supertest");
// const app = require("../../index");
// const mongoose = require("mongoose");
// const UserModel = require("../../models/userModel");

// jest.setTimeout(10000); // Set timeout to 10 seconds

// // Ensure MongoDB is connected before running tests
// beforeAll(async () => {
//   await mongoose.connect(process.env.MONGODB_URI);
// });

// // Start server and clean up database before each test
// beforeEach(async () => {
//   server = app.listen();
//   await UserModel.deleteMany(); // Clear users before each test
// });

// // Close server after each test
// afterEach(async () => {
//   if (server && server.close) {
//     await server.close();
//   }
// });

// // Close the MongoDB connection after all tests
// afterAll(async () => {
//   await mongoose.connection.close();
// });

// describe("POST /api/auth/forgot-password", () => {
//   it("should send a password reset link if the email exists", async () => {
//     const response = await request(app)
//       .post("/api/auth/forgot-password")
//       .send({ email: "test@example.com" }); // Use an existing test email or mock this behavior in your server

//     expect(response.statusCode).toBe(200);
//     expect(response.body.message).toBe(
//       "If an account with that email exists, a password reset link has been sent."
//     );
//   });

//   it("should return a success message even if the email does not exist", async () => {
//     const response = await request(app)
//       .post("/api/auth/forgot-password")
//       .send({ email: "nonexistent@example.com" });

//     expect(response.statusCode).toBe(200);
//     expect(response.body.message).toBe(
//       "If an account with that email exists, a password reset link has been sent."
//     );
//   });
// });

// const request = require("supertest");
// const app = require("../../index");
// const mongoose = require("mongoose");
// const UserModel = require("../../models/userModel");

// jest.setTimeout(10000); // Set timeout to 10 seconds

// // Ensure MongoDB is connected before running tests
// beforeAll(async () => {
//   await mongoose.connect(process.env.MONGODB_URI);
// });

// // Start server and clean up database before each test
// beforeEach(async () => {
//   server = app.listen();
//   await UserModel.deleteMany(); // Clear users before each test
// });

// // Close server after each test
// afterEach(async () => {
//   if (server && server.close) {
//     await server.close();
//   }
// });

// // Close the MongoDB connection after all tests
// afterAll(async () => {
//   await mongoose.connection.close();
// });

// describe("POST /api/auth/forgot-password", () => {
//   it("should send a password reset link if the email exists", async () => {
//     // Create a test user
//     await UserModel.create({
//       name: "Test User",
//       email: "test@example.com",
//       password: "password123",
//     });

//     const response = await request(app)
//       .post("/api/auth/forgot-password")
//       .send({ email: "test@example.com" });

//     expect(response.statusCode).toBe(200);
//     expect(response.body.message).toBe(
//       "If an account with that email exists, a password reset link has been sent."
//     );
//   });

//   it("should return a success message even if the email does not exist", async () => {
//     const response = await request(app)
//       .post("/api/auth/forgot-password")
//       .send({ email: "nonexistent@example.com" });

//     expect(response.statusCode).toBe(200);
//     expect(response.body.message).toBe(
//       "If an account with that email exists, a password reset link has been sent."
//     );
//   });

//   it("should return an error if the email field is empty", async () => {
//     const response = await request(app)
//       .post("/api/auth/forgot-password")
//       .send({ email: "" });

//     expect(response.statusCode).toBe(400);
//     expect(response.body.error).toBe("Email is required");
//   });

//   it("should generate a reset token for an existing user", async () => {
//     const user = await UserModel.create({
//       name: "Test User",
//       email: "test@example.com",
//       password: "password123",
//     });

//     await request(app)
//       .post("/api/auth/forgot-password")
//       .send({ email: "test@example.com" });

//     const updatedUser = await UserModel.findById(user._id);
//     expect(updatedUser.resetPasswordToken).toBeDefined();
//     expect(updatedUser.resetPasswordExpires).toBeDefined();
//   });
// });
const request = require("supertest");
const app = require("../../index");
const mongoose = require("mongoose");
const UserModel = require("../../models/userModel");
const { sendResetEmail } = require("../../utils/email");

jest.mock("../../utils/email");

jest.setTimeout(10000); // Set timeout to 10 seconds

// Ensure MongoDB is connected before running tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

// Start server and clean up database before each test
beforeEach(async () => {
  server = app.listen();
  await UserModel.deleteMany(); // Clear users before each test
  jest.clearAllMocks(); // Clear all mocks before each test
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
