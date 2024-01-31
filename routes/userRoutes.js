const express = require("express");
const userRouter = express.Router();

const { createUser, getUser } = require("../controllers/userController");
const { userAuth } = require("../middleware/auth-middleware");

userRouter.route("/create").post(createUser); // Route to Create User

userRouter.route("/").get(userAuth, getUser); // Route to Get the logged In User

module.exports = userRouter;
