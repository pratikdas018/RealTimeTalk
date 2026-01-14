import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await resend.emails.send({
    from: "Talksy <onboarding@resend.dev>",
    to: email,
    subject: "Your OTP for Talksy",
    html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`,
  });

  return otp;
};
