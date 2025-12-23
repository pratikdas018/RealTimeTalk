import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// 🔥 FORCE dotenv HERE (critical)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

// ✅ NOW env is guaranteed
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// 🔍 DEBUG (remove later)
console.log("☁️ Cloudinary Config:", {
  cloud: process.env.CLOUD_NAME,
  key: process.env.API_KEY ? "OK" : "MISSING",
  secret: process.env.API_SECRET ? "OK" : "MISSING",
});

const uploadOnCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "talksy_avatars",
    });

    fs.unlinkSync(filePath);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return null;
  }
};

export default uploadOnCloudinary;
