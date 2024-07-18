/**
 * Custom error class for application-specific errors
 */
export class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Error class for Bad Request (400) errors
 */
export class BadRequestError extends CustomError {
  constructor(message) {
    super(message, 400);
  }
}

/**
 * Error class for Unauthorized (401) errors
 */
export class UnauthorizedError extends CustomError {
  constructor(message) {
    super(message, 401);
  }
}

/**
 * Error class for Not Found (404) errors
 */
export class NotFoundError extends CustomError {
  constructor(message) {
    super(message, 404);
  }
}

/**
 * Error class for Internal Server Error (500) errors
 */
export class InternalServerError extends CustomError {
  constructor(message) {
    super(message, 500);
  }
}
