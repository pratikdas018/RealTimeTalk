import express from "express";
import passport from "passport";
import genToken from "../config/token.js";
import {
  signUp,
  login,
  logOut,
  verifyOtp,
  resendOtp,
} from "../controllers/auth.controllers.js";

const authRouter = express.Router();

/* ================= EMAIL AUTH ================= */

authRouter.post("/signup", signUp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/resend-otp", resendOtp);
authRouter.post("/login", login);
authRouter.get("/logout", logOut);

/* ================= GOOGLE AUTH ================= */

// Start Google login
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// ✅ Google callback (FIXED + SAFE)
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect:
      process.env.NODE_ENV === "production"
        ? "https://realtimetalk-frontend.onrender.com/login"
        : "http://localhost:5173/login",
    session: false,
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(
          process.env.NODE_ENV === "production"
            ? "https://realtimetalk-frontend.onrender.com/login"
            : "http://localhost:5173/login"
        );
      }

      const token = await genToken(req.user._id);

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,       // Render = HTTPS
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(
        process.env.NODE_ENV === "production"
          ? "https://realtimetalk-frontend.onrender.com"
          : "http://localhost:5173"
      );
    } catch (error) {
      console.error("Google callback error:", error);
      return res.redirect(
        process.env.NODE_ENV === "production"
          ? "https://realtimetalk-frontend.onrender.com/login"
          : "http://localhost:5173/login"
      );
    }
  }
);

export default authRouter;
