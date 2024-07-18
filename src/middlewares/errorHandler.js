import { CustomError } from "../utils/errorClasses.js";

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // If it's a custom error, use its status code and message
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        status: err.statusCode,
      },
    });
  }

  // For unhandled errors, send a generic server error response
  res.status(500).json({
    error: {
      message: "An unexpected error occurred",
      status: 500,
    },
  });
};
