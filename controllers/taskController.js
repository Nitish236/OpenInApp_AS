const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors/allErr");

const mongoose = require("mongoose");

// Models
const Task = require("../models/taskModel");
const SubTask = require("../models/subTaskModel");

/* -------------------------------------------------------------------------------------------------- */

//                       Function to Create a New Task

const createTask = async (req, res) => {
  // Retrieve Data
  const { title, description, due_date } = req.body;
  const userId = req.userId;

  // Validate input
  if (!title || !due_date || isNaN(Date.parse(due_date))) {
    throw new BadRequestError(
      "Invalid input. Title, description, and valid due date are required"
    );
  }

  // Determine priority based on due date
  const today = new Date();

  const dueDate = new Date(due_date);

  const dayDifference = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));

  const priority =
    dayDifference === 0
      ? 0
      : dayDifference <= 2
      ? 1
      : dayDifference <= 4
      ? 2
      : 3;

  // Create a new task
  const newTask = await Task.create({
    userId,
    title,
    description,
    due_date: dueDate,
    priority,
  });

  // Return the created task
  return res
    .status(StatusCodes.CREATED)
    .json({ msg: "Task created successfully.", task: newTask });
};

//                       Function to Get All Tasks
const getTasks = async (req, res) => {
  // Retrieve Data
  let { priority, due_date, page = 1, limit = 10 } = req.query; // Fallback values for page and limit

  if (isNaN(page) || page <= 0) {
    throw new BadRequestError("Invalid page value");
  }

  if (isNaN(limit) || limit <= 0) {
    throw new BadRequestError("Invalid limit value");
  }

  // Parse page and limit
  page = parseInt(page);
  limit = parseInt(limit);

  if (
    priority == undefined ||
    isNaN(priority) ||
    priority < 0 ||
    priority > 3
  ) {
    throw new BadRequestError("Invalid priority value");
  }

  // Parse priority
  priority = parseInt(priority);

  // Parse due_date
  let parsedDueDate;
  if (due_date) {
    parsedDueDate = new Date(due_date);
    if (isNaN(parsedDueDate.getTime())) {
      throw new BadRequestError("Invalid due_date format");
    }
  }

  // Aggregation pipeline
  const pipeline = [
    priority
      ? {
          $match: {
            priority,
          },
        }
      : {
          $match: {
            due_date: { $lte: parsedDueDate },
          },
        },
    {
      $sort: {
        priority: 1, // Sort by priority in ascending order
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
    {
      $project: {
        userId: 0,
        created_at: 0,
        updated_at: 0,
        deleted_at: 0,
      },
    },
  ];

  // Get Tasks
  const userTasks = await Task.aggregate(pipeline);

  // Check if tasks were found
  if (userTasks.length === 0) {
    throw new BadRequestError("No tasks found based on the specified filters.");
  }

  // Return the Tasks
  return res
    .status(StatusCodes.OK)
    .json({ msg: "All Users Tasks fetched successfully", userTasks });
};

//                       Function to Update Task (status, due_date)
const updateTask = async (req, res) => {
  // Retrieve Data
  const taskId = req.params.taskId;
  const { due_date, status } = req.body;

  // Validate input
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new BadRequestError("Invalid task ID format");
  }

  // Construct the update object dynamically
  const updateFields = {};

  // Validate status
  if (status !== undefined && status !== "TODO" && status !== "DONE") {
    throw new BadRequestError(
      "Invalid status value. It should be 'TODO' or 'DONE'."
    );
  } else {
    updateFields.status = status;
  }

  // Parse due_date
  if (due_date !== undefined) {
    let updatedDueDate = new Date(due_date);
    if (isNaN(updatedDueDate.getTime())) {
      throw new BadRequestError("Invalid due_date format");
    }
    updateFields.due_date = updatedDueDate;
  }

  // Check if status is updated to "DONE" and there are incomplete subtasks
  if (status === "DONE") {
    const incompleteSubtasksCount = await SubTask.countDocuments({
      task_id: taskId,
      status: 0,
      deleted_at: null,
    });

    if (incompleteSubtasksCount > 0) {
      throw new BadRequestError(
        "Cannot update task status to 'DONE' with incomplete subtasks."
      );
    }
  }

  // Update task fields
  const updatedTask = await Task.findOneAndUpdate(
    { _id: taskId, deleted_at: null },
    { $set: updateFields },
    { new: true }
  );

  // Check if the task was found and updated
  if (!updatedTask) {
    throw new NotFoundError("Task not found or already deleted.");
  }

  // Return the updated task
  return res.status(StatusCodes.OK).json({
    msg: "Task updated successfully.",
    task: updatedTask,
  });
};

//                       Function to Delete Task (and also the associated Sub Tasks)
const deleteTask = async (req, res) => {
  // Retrieve Data
  const taskId = req.params.taskId;

  // Validate input
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new BadRequestError("Invalid task ID format");
  }

  // MongoDB transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Soft delete associated subtasks
    await SubTask.updateMany(
      { taskId, deleted_at: null },
      { $set: { deleted_at: new Date() } },
      { session }
    );

    // Find the task and mark it as deleted
    const task = await Task.findOneAndUpdate(
      { _id: taskId, deleted_at: null },
      { $set: { deleted_at: new Date() } },
      { new: true, session }
    );

    // Check if the task was found and deleted
    if (!task) {
      throw new NotFoundError("Task not found or already deleted.");
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Return a success message
    return res
      .status(StatusCodes.OK)
      .json({ msg: "Task and associated subtasks soft deleted successfully." });
  } catch (error) {
    // Abort the transaction
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
