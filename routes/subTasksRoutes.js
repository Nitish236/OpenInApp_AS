const express = require("express");
const subTaskRouter = express.Router();

const { userAuth } = require("../middleware/auth-middleware");

const {
  createSubTask,
  getSubTasks,
  updateSubTask,
  deleteSubTask,
} = require("../controllers/subTaskController");

subTaskRouter.route("/create").post(userAuth, createSubTask); // Route to create Sub Task

subTaskRouter.route("/getTasks").get(userAuth, getSubTasks); // Route to Get Users Sub Tasks

subTaskRouter
  .route("/:subTaskId")
  .put(userAuth, updateSubTask) // Route to Update Sub Task (status)
  .delete(userAuth, deleteSubTask); // Route to update Delete Sub Task

module.exports = subTaskRouter;
