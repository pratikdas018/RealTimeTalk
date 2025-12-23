import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ FORCE dotenv to load backend/.env
dotenv.config({
  path: path.join(__dirname, ".env"),
});
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import { app, server } from "./socket/socket.js";

// Passport config (Google OAuth)
import "./config/passport.js";


const port = process.env.PORT || 5000;

/* -------------------- MIDDLEWARES -------------------- */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Session (required for passport)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true in production with HTTPS
      httpOnly: true,
    },
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());

/* -------------------- ROUTES -------------------- */

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);

/* -------------------- SERVER -------------------- */

server.listen(port, () => {
  connectDb();
  console.log(`🚀 Server running on port ${port}`);
});
