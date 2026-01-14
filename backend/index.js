import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import { app, server } from "./socket/socket.js";

// Passport config
import "./config/passport.js";

const port = process.env.PORT || 8000;

/* ---------------- TRUST PROXY (IMPORTANT) ---------------- */
app.set("trust proxy", 1);

/* -------------------- CORS -------------------- */

const allowedOrigins = [
  "https://realtimetalk-frontend.onrender.com",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
  })
);

/* -------------------- MIDDLEWARES -------------------- */

app.use(express.json());
app.use(cookieParser());

/* -------------------- PASSPORT -------------------- */

app.use(passport.initialize());

/* -------------------- ROUTES -------------------- */

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);

/* -------------------- SERVER -------------------- */

server.listen(port, async () => {
  await connectDb();
  console.log(`🚀 Server running on port ${port}`);
});
