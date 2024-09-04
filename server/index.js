const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/tunes", (req, res) => {
  // This is where you'll eventually fetch tunes from a database
  res.json([{ id: 1, title: "Sample Tune", hasExternalLink: true }]);
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
