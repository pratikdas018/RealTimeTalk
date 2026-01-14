import http from "http";
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
import "./config/passport.js";
import { initSocket } from "./socket/socket.js";

const app = express();
const server = http.createServer(app);

/* TRUST PROXY */
app.set("trust proxy", 1);

/* CORS */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://realtimetalk-frontend.onrender.com",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/message", messageRouter);

/* INIT SOCKET WITH SAME SERVER */
initSocket(server);

const PORT = process.env.PORT || 8000;

server.listen(PORT, async () => {
  await connectDb();
  console.log(`🚀 Server running on port ${PORT}`);
});
