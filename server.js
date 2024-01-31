require("express-async-errors");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
const dotenv = require("dotenv");

// Load environment variables from a .env file
dotenv.config();

// Import database-related modules
const connectToDB = require("./database/db");

// Import middlewares
const errorMiddleware = require("./middleware/error-handler");
const notFoundMiddleware = require("./middleware/not-found");

// Import
const authRouters = require("./routes/authRoutes");
const userRouters = require("./routes/userRoutes");
const taskRouters = require("./routes/taskRoutes");
const subTaskRouters = require("./routes/subTasksRoutes");

// Create an Express app
const app = express();

// Create an HTTP server
const server = http.createServer(app);

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes for authentication
app.use("/auth", authRouters);

// Routes for Users
app.use("/user", userRouters);

// Route for Tasks
app.use("/tasks", taskRouters);

// Route for Sub Tasks
app.use("/subtasks", subTaskRouters);

// Middlewares
app.use(errorMiddleware); // Middleware to handle all thrown errors
app.use(notFoundMiddleware); // Middleware to handle Routes that are not there

// Function to start the server
const startServer = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Connect to the database
      await connectToDB();

      console.log("\nDB connected !!!");

      // Start the server on the specified port
      server.listen(process.env.PORT, () => {
        console.log(`App listening at http://localhost:${process.env.PORT}\n`);
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Function to close the server
const closeServer = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Close the database connection
      await mongoose.connection.close();

      console.log("\nDB connection closed");

      // Close the server
      server.close();

      console.log("Server is closed\n");

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

// When running the file directly
if (require.main === module) {
  startServer().catch((error) => {
    console.log(error);
    console.error("\nError starting the server : ", error.message);

    closeServer().catch((error) => {
      console.error("Error closing the server : ", error.message);
    });
  });
}

// Export the server instance
module.exports = server;

// Import Cron Jobs
const updatePriorityJob = require("./cron/updatePriority");
const voiceCallerJob = require("./cron/voiceCaller");
