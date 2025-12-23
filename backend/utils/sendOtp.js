import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";

export const sendOtp = async (email) => {
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: "Talksy <no-reply@talksy.com>",
    to: email,
    subject: "Verify your Talksy account",
    html: `<h2>Your OTP is: <b>${otp}</b></h2><p>Valid for 10 minutes</p>`,
  });

  return otp;
};
