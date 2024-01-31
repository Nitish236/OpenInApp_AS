const mongoose = require("mongoose");

// Sub Task Schema
const subTaskSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: [true, "Task Id is required"],
  },
  status: { type: Number, enum: [0, 1], default: 0 }, // 0 - incomplete, 1 - complete
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
  deleted_at: { type: Date },
});

// Sub Task Model
const SubTask = mongoose.model("SubTask", subTaskSchema);

module.exports = SubTask;
