// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// const port = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// app.get("/api/tunes", (req, res) => {
//   // This is where you'll eventually fetch tunes from a database
//   res.json([{ id: 1, title: "Sample Tune", hasExternalLink: true }]);
// });

// app.listen(port, () => {
//   console.log(`Server is running on port: ${port}`);
// });

const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files (your tune images)
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Serve the comprehensive list
app.get("/api/tuneList", async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "data/tuneList.json"),
      "utf8"
    );
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ message: "Error reading tune list", error: err });
  }
});

// Serve individual tune data
app.get("/api/tune/:id", async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, `data/tunes/${req.params.id}.json`),
      "utf8"
    );
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(404).json({ message: "Tune not found", error: err });
  }
});

// Serve individual chord data
app.get("/api/chords/:id", async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, `data/tunes/${req.params.id}.json`),
      "utf8"
    );
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(404).json({ message: "Chords not found", error: err });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
