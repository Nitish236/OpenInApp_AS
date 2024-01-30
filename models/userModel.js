const mongoose = require("mongoose");

// User Schema

const userSchema = new mongoose.Schema({
  phone_number: { type: Number, required: [true, "Phone number is required"] },
  priority: {
    type: Number,
    enum: [0, 1, 2],
    required: [true, "Priority is required- [0,1,2]"],
    default: 0,
  },
});

// User Model
const User = mongoose.model("User", userSchema);

module.exports = User;
