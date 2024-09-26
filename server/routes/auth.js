// const express = require("express");
// const jwt = require("jsonwebtoken");
// const UserModel = require("../models/userModel");
// const router = express.Router();

// router.post("/signup", async (req, res) => {
//   try {
//     console.log("Received signup request:", req.body);
//     const { username, email, password } = req.body;

//     if (!username || !email || !password) {
//       return res
//         .status(400)
//         .send({ error: "Please provide all required fields" });
//     }

//     const user = new UserModel({ username, email, password });
//     await user.save();
//     console.log("User saved successfully:", user);
//     res.status(201).send({
//       message: "User created successfully. Waiting for admin verification.",
//     });
//   } catch (error) {
//     console.error("Error in signup:", error);
//     if (error.code === 11000) {
//       return res
//         .status(400)
//         .send({ error: "Email or username already exists" });
//     }
//     res.status(400).send({ error: error.message });
//   }
// });

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await UserModel.findOne({ email });
//     if (!user || !(await user.comparePassword(password))) {
//       return res.status(401).send({ error: "Invalid login credentials" });
//     }
//     if (!user.isVerified) {
//       return res.status(403).send({ error: "Account not verified" });
//     }
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "1d",
//     });
//     res.send({ user, token });
//   } catch (error) {
//     res.status(400).send({ error: error.message });
//   }
// });

// router.post("/verify", async (req, res) => {
//   try {
//     const { email, invitationToken } = req.body;
//     const user = await UserModel.findOne({ email, invitationToken });
//     if (!user) {
//       return res.status(400).send({ error: "Invalid verification attempt" });
//     }
//     user.isVerified = true;
//     user.invitationToken = undefined;
//     await user.save();
//     res.send({ message: "Account verified successfully" });
//   } catch (error) {
//     res.status(400).send({ error: error.message });
//   }
// });

// module.exports = router;
// auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    console.log("Received signup request:", req.body);
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .send({ error: "Please provide all required fields" });
    }

    // If role is not provided or is invalid, it will default to 'user'
    const user = new UserModel({ username, email, password, role });
    console.log("Attempting to save user:", user);
    await user.save();
    console.log("User saved successfully");

    res
      .status(201)
      .send({ message: "User created successfully", role: user.role });
  } catch (error) {
    console.error("Error in signup:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .send({ error: "Email or username already exists" });
    }
    res
      .status(500)
      .send({ error: "An unexpected error occurred", details: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({ error: "Invalid login credentials" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.send({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
