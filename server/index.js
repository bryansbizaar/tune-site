// const express = require("express");
// const connectDB = require("./config/db");
// const path = require("path");
// const fs = require("fs").promises;
// const cors = require("cors");
// // require("dotenv").config();
// const dotenv = require("dotenv");
// const authRoutes = require("./routes/auth");

// dotenv.config();
// // connectDB();

// // Async function to start the server
// const startServer = async () => {
//   try {
//     await connectDB();
//     app.listen(port, () => console.log(`Server running on port ${port}`));
//   } catch (error) {
//     console.error("Failed to connect to the database:", error);
//     process.exit(1);
//   }
// };

// startServer();

// const app = express();
// app.use("/api/auth", authRoutes);
// const port = process.env.PORT || 5000;

// app.use(cors());

// app.use(express.json());

// app.use("/api/auth", authRoutes);

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });

// // Serve static files (your tune images)
// app.use("/images", express.static(path.join(__dirname, "public/images")));

// // Serve the comprehensive list
// app.get("/api/tuneList", async (req, res) => {
//   try {
//     const data = await fs.readFile(
//       path.join(__dirname, "data/tuneList.json"),
//       "utf8"
//     );
//     res.json(JSON.parse(data));
//   } catch (err) {
//     res.status(500).json({ message: "Error reading tune list", error: err });
//   }
// });

// // Serve individual tune data
// app.get("/api/tune/:id", async (req, res) => {
//   try {
//     const data = await fs.readFile(
//       path.join(__dirname, `data/tunes/${req.params.id}.json`),
//       "utf8"
//     );
//     res.json(JSON.parse(data));
//   } catch (err) {
//     res.status(404).json({ message: "Tune not found", error: err });
//   }
// });

// // Serve individual chord data
// app.get("/api/chords/:id", async (req, res) => {
//   try {
//     const data = await fs.readFile(
//       path.join(__dirname, `data/tunes/${req.params.id}.json`),
//       "utf8"
//     );
//     res.json(JSON.parse(data));
//   } catch (err) {
//     res.status(404).json({ message: "Chords not found", error: err });
//   }
// });

// if (require.main === module) {
//   app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
//   });
// }

// module.exports = app;
const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const fs = require("fs").promises;
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Login route
app.post("/api/login", async (req, res) => {
  try {
    console.log("Received login request:", req.body);
    const { email, password } = req.body;

    // In a real application, you would validate these credentials against a database
    // This is a placeholder implementation
    if (email === "user@example.com" && password === "password123") {
      console.log("Login successful for:", email);
      res.json({ success: true, message: "Login successful" });
    } else {
      console.log("Login failed for:", email);
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Server error during login:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
});

// API endpoints
app.get("/api/tuneList", async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "data/tuneList.json"),
      "utf8"
    );
    res.json(JSON.parse(data));
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error reading tune list", error: err.message });
  }
});

app.get("/api/tune/:id", async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, `data/tunes/${req.params.id}.json`),
      "utf8"
    );
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(404).json({ message: "Tune not found", error: err.message });
  }
});

app.get("/api/chords/:id", async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, `data/tunes/${req.params.id}.json`),
      "utf8"
    );
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(404).json({ message: "Chords not found", error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server function
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
