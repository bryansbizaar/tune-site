// const express = require("express");
// const connectDB = require("./config/db");
// const path = require("path");
// const fs = require("fs").promises;
// const cors = require("cors");
// const dotenv = require("dotenv");
// const authRoutes = require("./routes/auth");

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(
//   cors({
//     origin: ["https://tune-site-backend.onrender.com", "http://localhost:5173"],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
// app.use(express.json());

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/images", express.static(path.join(__dirname, "public/images")));

// // API endpoints
// app.get("/api/tuneList", async (req, res) => {
//   try {
//     const data = await fs.readFile(
//       path.join(__dirname, "data/tuneList.json"),
//       "utf8"
//     );
//     res.json(JSON.parse(data));
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Error reading tune list", error: err.message });
//   }
// });

// app.get("/api/tune/:id", async (req, res) => {
//   try {
//     const data = await fs.readFile(
//       path.join(__dirname, `data/tunes/${req.params.id}.json`),
//       "utf8"
//     );
//     res.json(JSON.parse(data));
//   } catch (err) {
//     res.status(404).json({ message: "Tune not found", error: err.message });
//   }
// });

// app.get("/api/chords/:id", async (req, res) => {
//   try {
//     const data = await fs.readFile(
//       path.join(__dirname, `data/tunes/${req.params.id}.json`),
//       "utf8"
//     );
//     res.json(JSON.parse(data));
//   } catch (err) {
//     res.status(404).json({ message: "Chords not found", error: err.message });
//   }
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });

// // Start server function
// const startServer = async () => {
//   try {
//     await connectDB();
//     app.listen(port, () => {});
//   } catch (error) {
//     console.error("Failed to connect to the database:", error);
//     process.exit(1);
//   }
// };

// // Start the server
// if (require.main === module) {
//   startServer();
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

// CORS configuration
const allowedOrigins = [
  "https://tune-site.netlify.app", // Your Netlify production URL
  "http://localhost:5173", // Vite dev server
  "https://bryansbizaar.github.io", // GitHub Pages
  "https://tune-site-backend.onrender.com", // Your Render backend
];

// Updated CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        console.log("Request from origin:", origin); // Debug log
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Origin:", req.headers.origin);
  next();
});

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
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
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
