const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors/allErr");
const jwt = require("jsonwebtoken");

// Models
const User = require("../models/userModel");

require("dotenv").config();

/* -------------------------------------------------------------------------------------------------- */

//                       Function to Log In User

const loginUser = async (req, res) => {
  // Retrieve Data
  const { phone_number } = req.body;

  // Validate input
  if (!/^\d{10}$/.test(phone_number)) {
    throw new BadRequestError("Invalid phone number.");
  }

  // Check if the user exists
  const user = await User.findOne({ phone_number: parseInt(phone_number) });

  if (!user) {
    throw new BadRequestError("User with this phone number does not exist.");
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_TOKEN_EXPIRY,
  });

  // Set the token as a cookie
  res.cookie("userCookie", token, {
    httpOnly: true,
  });

  // Return the token in the response
  return res
    .status(StatusCodes.OK)
    .json({ msg: "User Log In successfull", token });
};

//                       Function to Log Out User
const logoutUser = (req, res) => {
  // Clear the JWT token cookie
  res.clearCookie("userCookie");

  return res.status(StatusCodes.OK).json({ msg: "User Log Out successful" });
};

module.exports = {
  loginUser,
  logoutUser,
};
