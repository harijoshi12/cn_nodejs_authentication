import { verifyToken } from "../services/jwtService.js";
import { UnauthorizedError } from "../utils/errorClasses.js";

/**
 * Middleware to authenticate requests
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new UnauthorizedError("No token provided");
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    throw new UnauthorizedError("Invalid token");
  }

  req.user = { id: decoded.id };
  next();
};
