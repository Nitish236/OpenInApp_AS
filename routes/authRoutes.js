const express = require("express");
const authRouter = express.Router();

const { loginUser, logoutUser } = require("../controllers/authController");

const { userAuth } = require("../middleware/auth-middleware");

authRouter.route("/user/login").post(loginUser); // Route to Log In User

authRouter.route("/user/logout").post(userAuth, logoutUser); // Route to Log Out User

module.exports = authRouter;
