import { verifyToken } from "../services/jwtService.js";
import { UnauthorizedError } from "../utils/errorClasses.js";

export const authenticate = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/auth/signin");
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new UnauthorizedError("Invalid token");
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie("token");
    return res.redirect("/auth/signin");
  }
};
