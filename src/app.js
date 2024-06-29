import express from "express";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import flash from "connect-flash";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import path from "path";

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome...");
});

export default app;
