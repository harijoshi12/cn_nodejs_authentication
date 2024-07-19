import express from "express";
import passport from "passport";
import {
  signUp,
  signIn,
  signOut,
  resetPassword,
  forgotPassword,
  resetPasswordWithToken,
  googleAuthCallback,
} from "../controllers/authController.js";
import {
  validateSignUp,
  validateSignIn,
  validateResetPassword,
} from "../middlewares/validators.js";
import { authenticate } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

// Page routes
router.get("/signup", (req, res) => res.render("signup", { title: "Sign Up" }));
router.get("/signin", (req, res) => res.render("signin", { title: "Sign In" }));
router.get("/forgot-password", (req, res) =>
  res.render("forgot", { title: "Forgot Password" })
);

// Protected routes
router.get("/home", authenticate, (req, res) =>
  res.render("home", { title: "Home", user: req.user })
);
router.get("/reset-password", authenticate, (req, res) =>
  res.render("reset", { title: "Reset Password" })
);

// API routes
router.post("/signup", validateSignUp, asyncHandler(signUp));
router.post("/signin", validateSignIn, asyncHandler(signIn));
router.post("/signout", authenticate, asyncHandler(signOut));
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
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/signin",
  }),
  asyncHandler(googleAuthCallback)
);

export default router;
