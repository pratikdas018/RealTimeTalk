import genToken from "../config/token.js";
import User from "../models/user.model.js";

export const googleSuccess = async (req, res) => {
  try {
    if (!req.user) {
      console.error("Google login failed: req.user missing");
      return res.redirect(
        "https://realtimetalk-frontend.onrender.com/login"
      );
    }

    // Create JWT
    const token = await genToken(req.user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend
    return res.redirect(
      "https://realtimetalk-frontend.onrender.com"
    );
  } catch (error) {
    console.error("Google callback error:", error);
    return res.redirect(
      "https://realtimetalk-frontend.onrender.com/login"
    );
  }
};
