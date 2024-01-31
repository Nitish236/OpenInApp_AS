const express = require("express");
const taskRouter = express.Router();

const { userAuth } = require("../middleware/auth-middleware");

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

taskRouter.route("/create").post(userAuth, createTask); // Route to create Task

taskRouter.route("/getTasks").get(userAuth, getTasks); // Route to Get Users Tasks

taskRouter
  .route("/:taskId")
  .put(userAuth, updateTask) // Route to Update Task (due_date, status)
  .delete(userAuth, deleteTask); // Route to update Delete Task

module.exports = taskRouter;
