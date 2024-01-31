const cron = require("node-cron");

// Models
const Task = require("../models/taskModel");

require("dotenv").config();

/* -------------------------------------------------------------------------------------------------------------------------------- */

/* Scenario :
   The Task will get updated in the morning and then calling 
   will start afterwards, (during cvalling times)
*/

// Update Priority Cron job run

cron.schedule(process.env.UPDATE_PRIORITY_TIME, async () => {
  try {
    // Update task priorities based on due_date using aggregation pipeline
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set it to the EOD(time)

    // Update the Priority
    await Task.aggregate([
      {
        $set: {
          priority: {
            $switch: {
              branches: [
                { case: { $lte: ["$due_date", today] }, then: 0 }, // Priority 0 for due today
                {
                  case: {
                    $in: [
                      { $subtract: ["$due_date", today] },
                      [24 * 60 * 60 * 1000, 2 * 24 * 60 * 60 * 1000 + 1000],
                    ],
                  },
                  then: 1,
                }, // Priority 1 for 1 or 2 days left
                {
                  case: {
                    $in: [
                      { $subtract: ["$due_date", today] },
                      [3 * 24 * 60 * 60 * 1000, 4 * 24 * 60 * 60 * 1000 + 1000],
                    ],
                  },
                  then: 2,
                }, // Priority 2 for 3 or 4 days left
              ],
              default: 3, // Priority 3 for 5 or more days left
            },
          },
        },
      },
      {
        $merge: {
          into: { coll: "tasks", db: process.env.DB_NAME },
          whenMatched: "merge",
        },
      },
    ]);

    console.log("Task priorities updated successfully.");
  } catch (error) {
    console.error("Error updating task priorities");
  }
});
