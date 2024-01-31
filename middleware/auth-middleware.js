const jwt = require("jsonwebtoken");
const UnauthenticatedError = require("../errors/unauthenticated");

/* ---------------------------------------------------------------------------- */

//                                  Function to check the Token or cookie

const userAuth = async (req, res, next) => {
  try {
    // Get Bearer Token, or cookie as you need
    const token = req.header("Authorization") || req.cookies.userCookie;

    if (!token) {
      throw new UnauthenticatedError("No Bearer Token found");
    }

    const secretKey = process.env.JWT_SECRET_KEY;

    // Verify token
    const decoded = await jwt.verify(token, secretKey);

    // Attach user information to the request
    req.userId = decoded.userId;

    next();
  } catch {
    throw new UnauthenticatedError("Invalid Token");
  }
};

module.exports = {
  userAuth,
};
