const path = require("path");
const dotenv = require("dotenv");

// Load the correct env file based on environment
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({
  path: path.resolve(__dirname, envFile),
});

const express = require("express");
const connectDB = require("./config/db");
const fs = require("fs").promises;
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(
  cors({
    origin: [
      "https://whangareitunes.com",
      "https://www.whangareitunes.com",
      "http://localhost:5173",
      "https://tune-site-backend.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/images", express.static(path.join(__dirname, "public/images")));

// API endpoints
app.get("/api/tuneList", async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "data/tuneList.json"),
      "utf8"
    );
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("Error reading tune list:", err);
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
    console.error("Error reading tune:", err);
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
    console.error("Error reading chords:", err);
    res.status(404).json({ message: "Chords not found", error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something broke!",
    error: err.message,
  });
});

// Start server function
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {});
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
