// utils/responseHandler.js

/**
 * Sends a success response
 * @param {Object} res - Express response object
 * @param {*} data - Data to be sent in the response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
export const successResponse = (
  res,
  data,
  message = "Success",
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 */
export const errorResponse = (res, message = "Error", statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * Sends a validation error response
 * @param {Object} res - Express response object
 * @param {Object} errors - Validation errors object
 */
export const validationErrorResponse = (res, errors) => {
  res.status(422).json({
    success: false,
    message: "Validation Error",
    errors,
  });
};
