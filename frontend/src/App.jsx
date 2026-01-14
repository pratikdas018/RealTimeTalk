import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import Profile from './pages/Profile'
import getCurrentUser from './customHooks/getCurrentUser'
import getOtherUsers from './customHooks/getOtherUsers'
import { serverUrl } from './main'
import { setOnlineUsers, setSocket } from './redux/userSlice'
import Footer from './components/Footer'
import VerifyOtp from "./pages/VerifyOtp";

function App() {
  const dispatch = useDispatch()
  const { userData, socket } = useSelector(state => state.user)

  // ✅ Correct hook usage
  useGetCurrentUser()
  useGetOtherUsers()

  useEffect(() => {
    if (userData) {
      const socketio = io(serverUrl, {
        query: { userId: userData._id },
        withCredentials: true,
      })

      dispatch(setSocket(socketio))

      socketio.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users))
      })

      return () => socketio.close()
    } else if (socket) {
      socket.close()
      dispatch(setSocket(null))
    }
  }, [userData])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Routes>
          <Route path='/login' element={!userData ? <Login /> : <Navigate to="/" />} />
          <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to="/profile" />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path='/' element={userData ? <Home /> : <Navigate to="/login" />} />
          <Route path='/profile' element={userData ? <Profile /> : <Navigate to="/signup" />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App
