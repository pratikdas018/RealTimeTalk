import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { serverUrl } from "../main";

function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  // 👇 email comes from signup page
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  // ❌ If user refreshes or opens directly
  if (!email) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-200">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-red-500 font-semibold">
            Invalid access. Please sign up again.
          </p>
        </div>
      </div>
    );
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );

      setSuccess(res.data.message || "Email verified successfully!");

      // ⏳ Small delay for UX
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setErr(error?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-slate-200 flex items-center justify-center">
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-gray-400 shadow-lg p-6 flex flex-col gap-6">
        <h1 className="text-center text-[22px] font-bold text-gray-700">
          Verify Your Email
        </h1>

        <p className="text-center text-gray-500 text-sm">
          OTP sent to <span className="font-semibold">{email}</span>
        </p>

        <form
          onSubmit={handleVerifyOtp}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full h-[50px] text-center text-[20px] tracking-widest outline-none border-2 border-[#20c7ff] rounded-lg"
            required
          />

          {err && <p className="text-red-500 text-sm text-center">*{err}</p>}
          {success && (
            <p className="text-green-600 text-sm text-center">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[45px] bg-[#20c7ff] text-white rounded-lg font-semibold hover:shadow-inner disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Optional resend (can wire later) */}
        <p className="text-center text-sm text-gray-500">
          Didn’t receive OTP?
          <span className="text-[#20c7ff] cursor-pointer font-semibold">
            {" "}Resend
          </span>
        </p>
      </div>
    </div>
  );
}

export default VerifyOtp;
