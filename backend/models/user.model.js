import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      // required ONLY for local users
      required: function () {
        return this.authProvider === "local";
      },
    },

    // 🔐 AUTH PROVIDER
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // ✅ EMAIL VERIFICATION STATUS
    isVerified: {
      type: Boolean,
      default: function () {
        // Google users are auto-verified
        return this.authProvider === "google";
      },
    },

    // 📧 OTP (ONLY for local/email signup)
    otp: {
      type: String,
    },

    otpExpiry: {
      type: Date,
    },

    // 🔑 GOOGLE UNIQUE ID
    googleId: {
      type: String,
      sparse: true, // allows null but keeps uniqueness
    },

    // (optional but recommended)
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
