import express from "express";
import passport from "passport";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import configurations and routes
import "./config/database.js";
import "./config/passport-setup.js";
import authRoutes from "./routes/auth.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Setup for ES module file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Adds various HTTP headers for security

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
});
app.use(limiter);

// Passport middleware
app.use(passport.initialize());

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.get("/", (req, res) => res.redirect("/auth/signin"));
app.use("/auth", authRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
