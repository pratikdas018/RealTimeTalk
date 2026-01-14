import genToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { sendOtp } from "../utils/sendOtp.js";

/* ================= SIGN UP (EMAIL + OTP) ================= */
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let otp;
    try {
      otp = await sendOtp(email);
    } catch (err) {
      console.error("OTP email failed:", err.message);
      return res.status(500).json({
        message: "Unable to send OTP email. Please try again later.",
      });
    }

    await User.create({
      fullName,
      email,
      password: hashedPassword,
      authProvider: "local",
      isVerified: false,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000,
    });

    return res.status(201).json({
      message: "OTP sent to your email. Please verify to continue.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res
      .status(500)
      .json({ message: "Signup failed. Please try again." });
  }
};



/* ================= VERIFY OTP ================= */
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (
            user.otp !== otp ||
            !user.otpExpiry ||
            user.otpExpiry < Date.now()
        ) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return res.status(200).json({
            message: "Email verified successfully. You can now login.",
        });
    } catch (error) {
        return res
            .status(500)
            .json({ message: `OTP verification error ${error.message}` });
    }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    let otp;
    try {
      otp = await sendOtp(email);
    } catch (err) {
      console.error("Resend OTP failed:", err.message);
      return res.status(500).json({
        message: "Unable to resend OTP. Please try again later.",
      });
    }

    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    return res.status(200).json({
      message: "New OTP sent to your email",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


/* ================= LOGIN ================= */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // 🚫 Block unverified email users
        if (user.authProvider === "local" && !user.isVerified) {
            return res
                .status(401)
                .json({ message: "Please verify your email first" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        const token = await genToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "none",
            secure: process.env.NODE_ENV === "production", // true in production (HTTPS)
        });

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
            },
        });
    } catch (error) {
        return res.status(500).json({ message: `login error ${error.message}` });
    }
};

/* ================= LOGOUT ================= */
export const logOut = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: `logout error ${error.message}` });
    }
};
