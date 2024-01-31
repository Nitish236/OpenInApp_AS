const { StatusCodes } = require("http-status-codes");
const { JsonWebTokenError } = require("jsonwebtoken");

/* ---------------------------------------------------------------------------------------------- */

// Middleware for Handling all errors

const errorHandlerMiddleware = (err, req, res, next) => {
  // Create the error
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Server error try again later",
  };

  // Error in case of Invalid or expired token
  if (err instanceof JsonWebTokenError) {
    customError.statusCode = StatusCodes.UNAUTHORIZED;
    customError.message = "Invalid or expired token";
  }

  // Include original error details for development
  if (process.env.NODE_ENV === "development") {
    customError.errorDetails = err;
  }

  // Send the Error
  return res.status(customError.statusCode).json({ msg: customError.message });
};

module.exports = errorHandlerMiddleware;
