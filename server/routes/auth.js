const express = require("express");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const crypto = require("crypto");
const router = express.Router();
const emailUtils = require("../utils/email");
// const { sendResetEmail } = require("../utils/email");

// Debug middleware for all auth routes
router.use((req, res, next) => {
  console.log("Auth Route accessed:", {
    method: req.method,
    path: req.path,
    body: req.body ? { ...req.body, password: "[REDACTED]" } : null,
    headers: {
      "content-type": req.headers["content-type"],
      "user-agent": req.headers["user-agent"],
    },
  });
  next();
});

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
  console.log("=== Starting forgot password process ===");

  // Add SendGrid configuration check
  console.log("SendGrid Config:", {
    apiKeyExists: !!process.env.SENDGRID_API_KEY,
    apiKeyLength: process.env.SENDGRID_API_KEY?.length,
    fromEmail: process.env.FROM_EMAIL,
  });

  try {
    const { email } = req.body;

    if (!email) {
      console.log("No email provided");
      return res.status(400).json({ error: "Email is required" });
    }

    console.log(`Processing reset request for email: ${email}`);

    const user = await UserModel.findOne({ email });
    if (!user) {
      console.log("No user found with this email");
      return res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent.",
      });
    }

    try {
      const token = crypto.randomBytes(20).toString("hex");
      console.log("Generated reset token:", { tokenLength: token.length });

      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}?reset_token=${token}`;
      console.log("Reset URL generated:", resetUrl);

      await emailUtils.sendResetEmail(user.email, resetUrl); // Use the imported function
      console.log("Reset email sent successfully");
    } catch (emailError) {
      console.error("Email sending failed:", {
        error: emailError.message,
        code: emailError.code,
        response: emailError.response?.body,
      });
      // Remove the token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return res.status(500).json({
        error: "Unable to send reset email. Please try again later.",
      });
    }

    res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
});

module.exports = router;
