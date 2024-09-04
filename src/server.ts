import express, { Response, ErrorRequestHandler } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";

// Express app setup
const app = express();
const port = process.env.PORT || 3000;
app.disable("x-powered-by");

// Determining directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectoryPath = path.join(__dirname, "../public");

// Check if 'public' directory exists
const checkPublicDir = async () => {
  try {
    await fs.access(publicDirectoryPath);
  } catch (err) {
    throw new Error(
      `'public' directory '${publicDirectoryPath}' does not exist`
    );
  }
};

/**
 * Middleware function to serve static files
 */
const setUpStaticFilesServer = (): void => {
  app.use("/", express.static(publicDirectoryPath));

  app.get("/", (res: Response) => {
    res.sendFile(path.join(publicDirectoryPath, "index.html"));
  });

  // Catches all remaining routes not previously caught
  app.all("*", (res: Response) => {
    res.status(404).send("404 Not Found");
  });
};

/**
 * Middleware to handle server errors
 */
const createErrorHandlers = (): void => {
  // Error Handling Middleware
  const handleErrors: ErrorRequestHandler = (err, _req, res, next) => {
    console.error(err.stack);
    res.status(500).send(`Something broke: ${err.message}`);
    next(err);
  };
  app.use(handleErrors);
};

/**
 * Function to handle application exceptions
 */
const handleApplicationExceptions = (): void => {
  process.on("uncaughtException", (err: Error) => {
    console.error(err);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
  });
};

// Run server
const startServer = async () => {
  await checkPublicDir();
  setUpStaticFilesServer();
  createErrorHandlers();
  handleApplicationExceptions();

  return new Promise<void>((resolve) => {
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
      resolve();
    });
  });
};

// Call function to start the server
startServer().catch((err) => {
  console.error("Failed to start server: ", err.message);
});
