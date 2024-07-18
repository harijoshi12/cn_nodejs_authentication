import nodemailer from "nodemailer";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";

// Convert ESM-specific variables to CommonJS equivalents
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a nodemailer transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Runs an email sending task in a separate worker thread
 * @param {Object} emailData - The email data to be sent
 * @returns {Promise} A promise that resolves when the email is sent
 */
function runEmailWorker(emailData) {
  return new Promise((resolve, reject) => {
    // Create a new worker thread
    const worker = new Worker(__filename, {
      workerData: emailData,
    });

    // Handle worker events
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

/**
 * Sends an email using the configured transporter
 * @param {Object} emailData - The email data to be sent
 */
async function sendEmail(emailData) {
  try {
    await transporter.sendMail(emailData);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Sends a welcome email to a new user
 * @param {Object} user - The user object containing email and name
 */
export const sendWelcomeEmail = async (user) => {
  const emailData = {
    from: '"Your App" <noreply@yourapp.com>',
    to: user.email,
    subject: "Welcome to Your App",
    text: `Hello ${user.name},\n\nWelcome to Your App! We're glad to have you on board.`,
    html: `<h1>Welcome to Your App!</h1><p>Hello ${user.name},</p><p>We're glad to have you on board.</p>`,
  };

  // Use worker thread if in main thread, otherwise send directly
  if (isMainThread) {
    await runEmailWorker(emailData);
  } else {
    await sendEmail(emailData);
  }
};

/**
 * Sends a password reset email to a user
 * @param {Object} user - The user object containing email
 * @param {string} resetToken - The password reset token
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `http://yourapp.com/reset-password/${resetToken}`;
  const emailData = {
    from: '"Your App" <noreply@yourapp.com>',
    to: user.email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Please go to this link to reset your password: ${resetUrl}`,
    html: `<h1>Password Reset Request</h1><p>You requested a password reset. Please click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`,
  };

  // Use worker thread if in main thread, otherwise send directly
  if (isMainThread) {
    await runEmailWorker(emailData);
  } else {
    await sendEmail(emailData);
  }
};

// Code to run if this file is executed as a worker thread
if (!isMainThread) {
  sendEmail(workerData).then(
    (result) => parentPort.postMessage(result),
    (error) => parentPort.postMessage({ error: error.message })
  );
}
