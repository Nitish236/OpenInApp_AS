const { StatusCodes } = require("http-status-codes");

const notFound = (req, res) => {
  // Send the Response
  return res
    .status(StatusCodes.NOT_FOUND)
    .json({ msg: "Route does not exist" });
};

module.exports = notFound;
