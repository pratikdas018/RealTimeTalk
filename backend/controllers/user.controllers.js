import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "Current user error" });
    }
};

export const editProfile = async (req, res) => {
  try {
    console.log("FILES:", req.files);
    console.log("BODY:", req.body);

    const { fullName } = req.body;
    const updateData = {};

    if (fullName) {
      updateData.fullName = fullName;
    }

    // 🔥 upload.any() puts files in req.files ARRAY
    if (req.files && req.files.length > 0) {
      const file = req.files[0]; // first uploaded file

      const avatarUrl = await uploadOnCloudinary(file.path);
      if (!avatarUrl) {
        return res.status(400).json({ message: "Image upload failed" });
      }

      updateData.avatar = avatarUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("🔥 PROFILE UPDATE ERROR:", error);
    return res.status(500).json({
      message: error.message || "Profile update failed",
    });
  }
};


export const getOtherUsers = async (req, res) => {
    try {
        const users = await User.find({
            _id: { $ne: req.userId },
        }).select("-password");
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: "Get users error" });
    }
};

export const search = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ message: "Query is required" });
        }

        const users = await User.find({
            _id: { $ne: req.userId },
            fullName: { $regex: query, $options: "i" },
        }).select("-password");

        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: "Search error" });
    }
};
