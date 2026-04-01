const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose.connect("mongodb://127.0.0.1:27017/farm2home")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/products"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/orders", require("./routes/orders"));

app.listen(3000, () => console.log("Server running on port 3000"));