import express from "express";
import passport from "passport";
import {
  signUp,
  signIn,
  resetPassword,
  forgotPassword,
  resetPasswordWithToken,
} from "../controllers/authController.js";
import {
  validateSignUp,
  validateSignIn,
  validateResetPassword,
} from "../middlewares/validators.js";
import { authenticate } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../services/jwtService.js";

const router = express.Router();

// Local authentication routes
router.post("/signup", validateSignUp, asyncHandler(signUp));
router.post("/signin", validateSignIn, asyncHandler(signIn));
router.post(
  "/reset-password",
  authenticate,
  validateResetPassword,
  asyncHandler(resetPassword)
);
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password/:token", asyncHandler(resetPasswordWithToken));

// Google authentication routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`/home?token=${token}`);
  }
);

export default router;
