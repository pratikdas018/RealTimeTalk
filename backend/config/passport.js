import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

// Debug (optional)
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // ✅ Works for both local & production
      callbackURL:
        process.env.NODE_ENV === "production"
          ? "https://realtimetalk-backend.onrender.com/api/auth/google/callback"
          : "http://localhost:8000/api/auth/google/callback",
    },

    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // ✅ Safe optional chaining (fixes VS Code warning)
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Google account has no email"), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            fullName: profile.displayName,
            email,
            avatar: profile.photos?.[0]?.value,
            authProvider: "google",
            isVerified: true,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// ✅ Session handling
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
