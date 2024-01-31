const mongoose = require("mongoose");

// Task Schema
const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User Id is required"],
  },
  title: { type: String, required: [true, "Title of task is required"] },
  description: {
    type: String,
    required: [true, "Description of task is required"],
  },
  due_date: { type: Date, required: [true, "Due date of task is required"] },
  priority: { type: Number },
  status: {
    type: String,
    enum: ["TODO", "IN_PROGRESS", "DONE"],
    default: "TODO",
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
  deleted_at: { type: Date },
});

// Task Model
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
