const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors/allErr");

const mongoose = require("mongoose");

const User = require("../models/userModel");

/* -------------------------------------------------------------------------------------------------- */

//                       Function to Create a New User

const createUser = async (req, res) => {
  // Retrieve Data
  const { phone_number, priority } = req.body;

  // Validate input
  if (
    !/^\d{10}$/.test(phone_number) ||
    isNaN(priority) ||
    priority < 0 ||
    priority > 2
  ) {
    throw new BadRequestError("Invalid phone number or priority.");
  }

  // Check if the phone number is unique
  const existingUser = await User.exists({ phone_number });

  if (existingUser) {
    throw new BadRequestError("User with this phone number already exists.");
  }

  // Create a new user
  const newUser = await User.create({
    phone_number,
    priority,
  });

  // Return the created user
  return res
    .status(StatusCodes.CREATED)
    .json({ msg: "User Created successfully.", user: newUser });
};

//                       Function to Get User

const getUser = async (req, res) => {
  // Get User Id
  const userId = req.userId;

  // Validate input
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError("Invalid user ID format");
  }

  // Get the User
  const user = await User.findById(userId);

  // Check if the user was found
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Return the user
  return res
    .status(StatusCodes.OK)
    .json({ msg: "User fetched successfully", user });
};

module.exports = {
  createUser,
  getUser,
};
