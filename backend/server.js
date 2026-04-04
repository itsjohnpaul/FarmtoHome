const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Note: Static uploads won't persist on Vercel's temporary file system.
// Consider using Cloudinary or AWS S3 for images later.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Use an Environment Variable for your Mongo URI!
const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/farm2home";

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("Mongo Error:", err));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/products"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orders"));

// Add a default route to test if the server is alive
app.get("/", (req, res) => res.send("Farm2Home API is running"));

// CRITICAL FOR VERCEL:
module.exports = app;