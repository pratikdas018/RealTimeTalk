import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../main'
import { useDispatch } from 'react-redux'
import { FcGoogle } from "react-icons/fc";
import { setSelectedUser, setUserData } from '../redux/userSlice'

function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [show, setShow] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const googleLogin = () => {
    window.open(`${serverUrl}/api/auth/google`, "_self");
  };

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErr("")

    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      )

      // ✅ Safe check
      if (!res || !res.data) {
        throw new Error("No response data received from server.")
      }

      // ✅ Optional: check for expected user object
      if (!res.data.user && !res.data._id) {
        throw new Error("Invalid user data returned.")
      }

      // ✅ Accept both response formats (either { user: {...} } or full user object)
      const userData = res.data.user || res.data

      dispatch(setUserData(userData))
      dispatch(setSelectedUser(null))

      setEmail("")
      setPassword("")
      navigate("/")
    } catch (error) {
      console.error("Login Error:", error)

      // ✅ Defensive error handling
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again."

      setErr(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full h-[100vh] bg-slate-200 flex items-center justify-center'>
      <div className='w-full max-w-[500px] h-[600px] bg-white rounded-lg shadow-gray-400 shadow-lg flex flex-col gap-[30px]'>
        <div className='w-full h-[200px] bg-[#19cdff] rounded-b-[30%] shadow-gray-400 shadow-lg flex items-center justify-center'>
          <h1 className='text-gray-600 font-bold text-[19px]'>
            Login to <span className='text-white'>Talksy</span>
          </h1>
        </div>

        <form
          className='w-full flex flex-col gap-[20px] items-center'
          onSubmit={handleLogin}
        >
          <input
            type="email"
            placeholder='Email'
            className='w-[90%] h-[50px] outline-none border-2 border-[#20c7ff] px-[20px] py-[10px] bg-white rounded-lg shadow-gray-200 shadow-lg text-gray-700 text-[19px]'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />

          <div className='w-[90%] h-[50px] border-2 border-[#20c7ff] overflow-hidden rounded-xl shadow-gray-200 shadow-lg relative'>
            <input
              type={show ? "text" : "password"}
              placeholder='Password'
              className='w-full h-full outline-none px-[20px] py-[10px] bg-white rounded-lg text-gray-700 text-[19px]'
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <span
              className='absolute top-[10px] right-[20px] text-[19px] text-[#20c7ff] font-semibold cursor-pointer'
              onClick={() => setShow((prev) => !prev)}
            >
              {show ? "hide" : "show"}
            </span>
          </div>

          {err && <p className='text-red-500'>*{err}</p>}

          <button
            className='px-[20px] py-[10px] bg-[#20c7ff] rounded-2xl shadow-gray-400 shadow-lg text-[20px] w-[150px] font-semibold mt-[20px] hover:shadow-inner'
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </button>


          <button
            type="button"
            onClick={googleLogin}
            className="w-[90%] flex items-center justify-center gap-3
             border border-gray-300 bg-white text-gray-700
             py-[12px] rounded-xl shadow-sm
             hover:shadow-md hover:bg-gray-50
             transition-all duration-200 text-[16px] font-medium"
          >
            <FcGoogle className="text-[22px]" />
            Continue with Google
          </button>


          <p
            className='cursor-pointer'
            onClick={() => navigate("/signup")}
          >
            Want to create a new account?
            <span className='text-[#20c7ff] font-bold'> SignUp</span>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
