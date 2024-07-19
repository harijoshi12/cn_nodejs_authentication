import User from "../models/User.js";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "../services/emailService.js";
import { generateToken, verifyToken } from "../services/jwtService.js";
import {
  BadRequestError,
  NotFoundError,
  InternalServerError,
} from "../utils/errorClasses.js";
import { verifyRecaptcha } from "../services/recaptchaService.js";
import crypto from "crypto";

export const signUp = async (req, res) => {
  const { email, password, name, recaptchaToken } = req.body;

  // Verify reCAPTCHA
  const recaptchaVerified = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaVerified) {
    throw new BadRequestError("reCAPTCHA verification failed");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError("Email already in use");
  }

  const user = new User({ email, password, name });
  await user.save();

  // Send welcome email asynchronously
  sendWelcomeEmail(user).catch(console.error);

  const token = generateToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  res.status(201).json({ message: "User created successfully" });
};

export const signIn = async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  // Verify reCAPTCHA
  const recaptchaVerified = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaVerified) {
    throw new BadRequestError("reCAPTCHA verification failed");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new BadRequestError("Incorrect password");
  }

  const token = generateToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  res.json({ message: "Signed in successfully" });
};

export const signOut = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Signed out successfully" });
};

export const resetPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new BadRequestError("Incorrect old password");
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password reset successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError("No user found with this email");
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  try {
    // Send password reset email asynchronously
    sendPasswordResetEmail(user, resetToken).catch(console.error);
    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    throw new InternalServerError(
      "Failed to send password reset email. Please try again later."
    );
  }
};

export const resetPasswordWithToken = async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError("Password reset token is invalid or has expired");
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password has been reset successfully" });
};

export const googleAuthCallback = async (req, res) => {
  try {
    const token = generateToken(req.user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.redirect("/auth/home");
  } catch (error) {
    console.error("Google auth callback error:", error);
    res.redirect("/auth/signin");
  }
};
