const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to uploads directory
  },
  filename: (req, file, cb) => {
    // Generate unique filename with user ID
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  }
});

// Upload profile photo
router.post("/upload-photo", authenticateToken, upload.single("profilePhoto"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Update user's profile photo path
    const photoUrl = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user.id, { profilePhoto: photoUrl });

    res.json({
      message: "Profile photo uploaded successfully",
      photoUrl: photoUrl
    });
  } catch (error) {
    console.error("Error uploading photo:", error);
    res.status(500).json({ message: "Error uploading photo" });
  }
});

// Get user profile (including photo)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

module.exports = router;