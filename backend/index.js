import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import { app, server } from "./socket/socket.js";

// Passport config
import "./config/passport.js";

const port = process.env.PORT || 8000;

/* -------------------- CORS -------------------- */

const allowedOrigins = [
  "https://realtimetalk-frontend.onrender.com",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* -------------------- MIDDLEWARES -------------------- */

app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    name: "talksy.sid",
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

/* -------------------- ROUTES -------------------- */

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);

/* -------------------- SERVER -------------------- */

server.listen(port, async () => {
  await connectDb();
  console.log(`🚀 Server running on port ${port}`);
});
