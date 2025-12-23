import express from "express";
import passport from "passport";
import {
  signUp,
  login,
  logOut,
  verifyOtp,
  resendOtp
} from "../controllers/auth.controllers.js";
import {googleSuccess } from "../controllers/googleAuth.controllers.js";

const authRouter = express.Router();

/* ================= EMAIL AUTH ================= */

//Google login gets JWT cookie
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleSuccess
);

// Signup with email (OTP sent)
authRouter.post("/signup", signUp);

// Verify email OTP
authRouter.post("/verify-otp", verifyOtp);

//resend OTP
authRouter.post("/resend-otp", resendOtp);

// Login (blocked if not verified)
authRouter.post("/login", login);

// Logout
authRouter.get("/logout", logOut);

/* ================= GOOGLE AUTH ================= */

// Start Google login
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google callback
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:5173",
    failureRedirect: "http://localhost:5173/login",
  })
);

export default authRouter;
