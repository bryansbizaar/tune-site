const express = require("express");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const crypto = require("crypto");
const router = express.Router();
const { sendResetEmail } = require("../utils/email");

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create new user
    const newUser = new UserModel({ name, email, password });
    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, stayLoggedIn } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find the user by email
    const user = await UserModel.findOne({ email });

    // If no user found or password doesn't match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Set token expiration based on stayLoggedIn preference
    const expiresIn = stayLoggedIn ? "30d" : "1d";

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      token,
      expiresIn,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    console.log("=== Starting password reset process ===");
    const { email } = req.body;
    console.log("Request received for email:", email);

    // Log environment configuration
    console.log("Environment configuration:", {
      nodeEnv: process.env.NODE_ENV,
      frontendUrl: process.env.FRONTEND_URL,
      sendgridConfigured: !!process.env.SENDGRID_API_KEY,
      senderEmail: process.env.SENDGRID_VERIFIED_SENDER,
    });

    if (!email) {
      console.log("No email provided in request");
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if user exists
    console.log("Looking up user in database...");
    const user = await UserModel.findOne({ email });

    if (!user) {
      console.log("No user found with this email");
      // We still return 200 for security reasons
      return res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    console.log("User found, generating reset token...");
    // Generate reset token
    const token = crypto.randomBytes(20).toString("hex");
    console.log("Token generated");

    // Save token to user
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    console.log("Saving token to user...");
    await user.save();
    console.log("Token saved successfully");

    // Construct reset URL
    const resetUrl = `${process.env.FRONTEND_URL}?reset_token=${token}`;
    console.log("Reset URL generated:", resetUrl);

    try {
      console.log("Attempting to send reset email...");
      // Add more detailed logging to sendResetEmail function call
      const emailInfo = await sendResetEmail(user.email, resetUrl);
      console.log("Email sent successfully:", emailInfo);

      res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    } catch (emailError) {
      console.error("Failed to send reset email:", {
        error: emailError.message,
        stack: emailError.stack,
        code: emailError.code,
        response: emailError.response?.body,
      });

      // Clean up the token since email failed
      console.log("Cleaning up reset token due to email failure");
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      throw new Error(`Failed to send reset email: ${emailError.message}`);
    }
  } catch (error) {
    console.error("Password reset process failed:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.body,
    });

    res.status(500).json({
      error: "An unexpected error occurred",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    console.log("=== Starting password reset process ===");
    const { token, newPassword } = req.body;

    // Find user by token
    console.log("Looking up user by reset token...");
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Invalid or expired token");
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Set new password
    console.log("Valid token found, updating password...");
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    console.log("Password successfully updated");

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

// Add a new route for resetting the password
// router.post("/reset-password", async (req, res) => {
//   try {
//     const { token, newPassword } = req.body;

//     // Find user by token
//     const user = await UserModel.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ error: "Invalid or expired token" });
//     }

//     // Set new password
//     user.password = newPassword;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();

//     res.status(200).json({ message: "Password has been reset" });
//   } catch (error) {
//     console.error("Reset password error:", error);
//     res.status(500).json({ error: "An unexpected error occurred" });
//   }
// });

module.exports = router;
