import genToken from "../config/token.js";

export const googleSuccess = async (req, res) => {
  const user = req.user;

  const token = await genToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "Strict",
    secure: false,
  });

  res.redirect("http://localhost:5173");
};
