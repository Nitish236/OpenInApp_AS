const { StatusCodes } = require("http-status-codes");
const { BadRequestError } = require("../errors/allErr");
const mongoose = require("mongoose");

const Task = require("../models/taskModel");
const SubTask = require("../models/subTaskModel");

/* -------------------------------------------------------------------------------------------------- */

//                       Function to Create a New Sub Task

const createSubTask = async (req, res) => {
  // Retrieve Data
  const { taskId } = req.body;
  console.log("H - ", taskId);

  // Validate input
  if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
    throw new BadRequestError("Task ID is required or invalid");
  }

  // Check if the task exists and belongs to the user
  const task = await Task.findById(taskId);

  if (!task) {
    throw new BadRequestError("Task not found or does not belong to the user.");
  }

  // Create a new subtask
  const newSubTask = await SubTask.create({
    taskId,
    status: 0, // For incomplete Task
  });

  // Return the created subtask
  return res
    .status(StatusCodes.CREATED)
    .json({ msg: "SubTask created successfully.", subtask: newSubTask });
};

//                       Function to Get Sub tasks

const getSubTasks = async (req, res) => {
  //  Retrieve data
  const { taskId } = req.query;

  // Validate input
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new BadRequestError("Invalid task ID format");
  }

  // Build the aggregation pipeline
  const pipeline = [
    {
      $match: {
        taskId: new mongoose.Types.ObjectId(taskId),
      },
    },
  ];

  // Get Sub Tasks
  const userSubTasks = await SubTask.aggregate(pipeline);

  // Check if tasks were found
  if (userSubTasks.length === 0) {
    throw new BadRequestError(
      "No Sub tasks found based on the specified filters."
    );
  }

  // Return the result
  return res.status(StatusCodes.OK).json({
    msg: "All Users Sub Tasks fetched successfully.",
    subtasks: userSubTasks,
  });
};

//                       Function to Update Sub Task (Status)

const updateSubTask = async (req, res) => {
  // Retrieve data
  const subTaskId = req.params.subTaskId;
  let { status } = req.body;

  // Validate input
  if (!mongoose.Types.ObjectId.isValid(subTaskId)) {
    throw new BadRequestError("Invalid subtask ID format");
  }

  // Validate status
  if (status === undefined || isNaN(status) || (status !== 0 && status !== 1)) {
    throw new BadRequestError("Invalid status value. It should be 0 or 1.");
  }

  // Parse Status
  status = parseInt(status);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update subtask status
    const updatedSubTask = await SubTask.findOneAndUpdate(
      { _id: subTaskId, deleted_at: null },
      { $set: { status } },
      { new: true, session }
    );

    // Check if the subtask was found and updated
    if (!updatedSubTask) {
      throw new NotFoundError("Subtask not found or already deleted.");
    }

    /* Scenario :
      
      Whenever the Subtask status gets updated
      then based on that logic we should update
      the Status of the Task

    */

    // Use aggregation pipeline to get counts
    const [counts] = await SubTask.aggregate([
      {
        $match: {
          task_id: updatedSubTask.taskId,
          deleted_at: null,
        },
      },
      {
        $group: {
          _id: null,
          incompleteCount: {
            $sum: {
              $cond: {
                if: { $eq: ["$status", 0] },
                then: 1,
                else: 0,
              },
            },
          },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    // Extract counts from the aggregation result
    const incompleteSubtasksCount = counts ? counts.incompleteCount : 0;
    const totalSubtasksCount = counts ? counts.totalCount : 0;

    // Update the status of the associated task based on the subtask status
    let updatedTaskStatus;

    if (status === 1) {
      // If any Subtask left then it will always be in "IN_PROGRESS"
      updatedTaskStatus = incompleteSubtasksCount > 0 ? "IN_PROGRESS" : "DONE";
    } else {
      // If any one Task is done then "IN_PROGRESS"
      updatedTaskStatus =
        totalSubtasksCount === incompleteSubtasksCount ? "TODO" : "IN_PROGRESS";
    }

    await Task.findOneAndUpdate(
      { _id: updatedSubTask.taskId, deleted_at: null },
      { $set: { status: updatedTaskStatus } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Return the updated subtask
    return res.status(StatusCodes.OK).json({
      msg: "Subtask status updated successfully.",
      subtask: updatedSubTask,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    // Handle error
    throw error;
  }
};

//                       Function to Delete Sub Task

const deleteSubTask = async (req, res) => {
  // Retrieve data
  const subTaskId = req.params.subTaskId;

  // Validate input
  if (!mongoose.Types.ObjectId.isValid(subTaskId)) {
    throw new BadRequestError("Invalid subtask ID format");
  }

  // Find the subtask and mark it as deleted
  const subTask = await SubTask.findOneAndUpdate(
    { _id: subTaskId, deleted_at: null },
    { $set: { deleted_at: new Date() } },
    { new: true }
  );

  // Check if the subtask was found and deleted
  if (!subTask) {
    throw new NotFoundError("Subtask not found or already deleted.");
  }

  // Return a success message
  return res
    .status(StatusCodes.OK)
    .json({ msg: "Subtask soft deletion successfully." });
};

module.exports = {
  createSubTask,
  getSubTasks,
  updateSubTask,
  deleteSubTask,
};
