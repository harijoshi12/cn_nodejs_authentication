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

export const signUp = async (req, res) => {
  const { email, password, name, recaptchaToken } = req.body;

  // Verify reCAPTCHA
  const recaptchaVerified = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaVerified) {
    throw new BadRequestError("reCAPTCHA verification failed");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError("Email already in use");
  }

  // Create new user
  const user = new User({ email, password, name });
  await user.save();

  // Send welcome email asynchronously
  sendWelcomeEmail(user).catch(console.error);

  // Generate JWT
  const token = generateToken(user);
  res.status(201).json({ message: "User created successfully", token });
};

export const signIn = async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  // Verify reCAPTCHA
  const recaptchaVerified = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaVerified) {
    throw new BadRequestError("reCAPTCHA verification failed");
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new BadRequestError("Incorrect password");
  }

  // Generate JWT
  const token = generateToken(user);
  res.json({ message: "Signed in successfully", token });
};

export const resetPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  // Check old password
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new BadRequestError("Incorrect old password");
  }

  // Set new password
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

  // Generate reset token
  const resetToken = generateToken(user, "1h");
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

  // Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    throw new BadRequestError("Invalid or expired token");
  }

  // Find user with valid reset token
  const user = await User.findOne({
    _id: decoded.id,
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new BadRequestError("Password reset token is invalid or has expired");
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: "Password has been reset successfully" });
};
