const cron = require("node-cron");
const twilio = require("twilio");

const Task = require("../models/taskModel");

require("dotenv").config();

/* -------------------------------------------------------------------------------------------------------- */

// Create Client
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_TOKEN
);

// Voice calling job to run

cron.schedule(process.env.VOICECALL_TIME, async () => {
  try {
    // Your voice calling logic here
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set it to the EOD(time)

    // Pipeline to Get the today's incomplete tasks
    const pipeline = [
      {
        $match: {
          due_date: { $lte: today },
          status: { $ne: "DONE" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId", // Field in Task model
          foreignField: "_id", // Field in User Model
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $sort: {
          "user.priority": 1,
        },
      },
    ];

    // Fetch overdue tasks with user details and sort by user priority
    const overdueTasks = await Task.aggregate(pipeline);

    console.log("Voice Calling started : ");

    // Iterate through each task and initiate voice call
    for (const task of overdueTasks) {
      // Get the User details
      const { user } = task;

      try {
        const call = await client.calls.create({
          url: `https://demo.twilio.com/docs/voice.xml`,
          to: `+91${user.phone_number}`, // User phone number
          from: process.env.TWILIO_PHONE_NUMBER,
        });

        console.log(
          `Voice call initiated for task ID ${task._id} to ${user.phone_number}`
        );

        // Waiting for 40 sec before intiating next call
        await new Promise((resolve) => setTimeout(resolve, 40000));

        // Checking the Status of the call
        const callStatus = await monitorCallStatus(call.sid);

        // Check if the call was completed or not
        if (callStatus === "completed") {
          console.log(
            `Voice call, Task ID : ${task._id} to ${user.phone_number} was Successfull`
          );
          break;
        } else {
          console.log(
            `Voice call, Task ID : ${task._id} to ${user.phone_number} was not attended by anyone.`
          );
        }
      } catch (error) {
        console.log(error);
        console.error(
          `Error initiating voice call for task ID ${task._id}: ${error.message}`
        );
      }
    }
  } catch (error) {
    console.error("Error in voice calling cron job:", error.message);
  }
});

//                  Function to Check call Status
async function monitorCallStatus(callSid) {
  try {
    // Get call status
    const call = await client.calls(callSid).fetch();

    return call.status;
  } catch (error) {
    console.error(
      `Error monitoring call status for call SID ${callSid}: ${error.message}`
    );

    throw error; // Handling error
  }
}
