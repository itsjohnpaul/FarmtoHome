const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  userType: String,
  phone: String,
  address: String,
  profilePhoto: String // URL or path to profile photo
});

module.exports = mongoose.model("User", UserSchema);