import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../main";

function SignUp() {
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { fullName, email, password },
        { withCredentials: true }
      );

      alert(res.data.message);

      // 👉 Go to OTP verification page
      navigate("/verify-otp", {
        state: { email },
      });

      setFullName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setErr(error?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[100vh] bg-slate-200 flex items-center justify-center">
      <div className="w-full max-w-[500px] h-[600px] bg-white rounded-lg shadow-gray-400 shadow-lg flex flex-col gap-[30px]">
        <div className="w-full h-[200px] bg-[#19cdff] rounded-b-[30%] shadow-gray-400 shadow-lg flex items-center justify-center">
          <h1 className="text-gray-600 font-bold text-[19px]">
            Welcome to <span className="text-white">Talksy</span>
          </h1>
        </div>

        <form
          className="w-full flex flex-col gap-[20px] items-center"
          onSubmit={handleSignUp}
        >
          <input
            type="text"
            placeholder="Full Name"
            className="w-[90%] h-[50px] outline-none border-2 border-[#20c7ff] px-[20px] py-[10px] bg-white rounded-lg shadow-gray-200 shadow-lg text-gray-700 text-[19px]"
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-[90%] h-[50px] outline-none border-2 border-[#20c7ff] px-[20px] py-[10px] bg-white rounded-lg shadow-gray-200 shadow-lg text-gray-700 text-[19px]"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />

          <div className="w-[90%] h-[50px] border-2 border-[#20c7ff] overflow-hidden rounded-xl shadow-gray-200 shadow-lg relative">
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              className="w-full h-full outline-none px-[20px] py-[10px] bg-white rounded-lg text-gray-700 text-[19px]"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <span
              className="absolute top-[10px] right-[20px] text-[19px] text-[#20c7ff] font-semibold cursor-pointer"
              onClick={() => setShow((prev) => !prev)}
            >
              {show ? "hide" : "show"}
            </span>
          </div>

          {err && <p className="text-red-500">*{err}</p>}

          <button
            className="px-[20px] py-[10px] bg-[#20c7ff] rounded-2xl shadow-gray-400 shadow-lg text-[20px] w-[150px] font-semibold mt-[20px]"
            disabled={loading}
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>

          <p className="cursor-pointer" onClick={() => navigate("/login")}>
            Already have an account?
            <span className="text-[#20c7ff] font-bold"> Login</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
