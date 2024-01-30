const jwt = require("jsonwebtoken");
const UnauthenticatedError = require("../errors/unauthenticated");

exports.authMiddleware = (req, res, next) => {
  // Get Bearer Token
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    throw new UnauthenticatedError("No Bearer Token found");
  }

  const secretKey = process.env.JWT_SECRET_KEY;

  // Verify token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      throw new UnauthenticatedError("Invalid Token");
    }

    next();
  });
};
