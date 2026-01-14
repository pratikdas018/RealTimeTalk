import express from "express";
import passport from "passport";
import {
  signUp,
  login,
  logOut,
  verifyOtp,
  resendOtp,
} from "../controllers/auth.controllers.js";
import { googleSuccess } from "../controllers/googleAuth.controllers.js";

const authRouter = express.Router();

/* ================= EMAIL AUTH ================= */

// Signup with email (OTP sent)
authRouter.post("/signup", signUp);

// Verify email OTP
authRouter.post("/verify-otp", verifyOtp);

// Resend OTP
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

// ✅ SINGLE Google callback (FIXED)
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async (req, res) => {
    const token = await genToken(req.user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const frontendURL =
      process.env.NODE_ENV === "production"
        ? "https://realtimetalk-frontend.onrender.com"
        : "http://localhost:5173";

    res.redirect(frontendURL);
  }
);

export default authRouter;
