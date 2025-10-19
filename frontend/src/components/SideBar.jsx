import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import io from 'socket.io-client'
import dp from '../assets/dp.webp'
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { BiLogOutCircle } from "react-icons/bi";
import axios from 'axios';
import { serverUrl } from '../main';
import { setOtherUsers, setSelectedUser, setUserData, setSocket, setOnlineUsers } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';

function SideBar() {
  const { userData, otherUsers, selectedUser, socket, onlineUsers } = useSelector(state => state.user);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔹 Logout handler
  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      dispatch(setUserData(null));
      dispatch(setOtherUsers(null));
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  // 🔹 Initialize socket after userData is available
  useEffect(() => {
    if (!userData?._id) return;

    // prevent multiple socket connections
    if (socket) return;

    const newSocket = io("http://localhost:3000", {
      query: { userId: userData._id }
    });

    dispatch(setSocket(newSocket));

    // Listen for online users updates
    newSocket.on("onlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    // Cleanup
    return () => {
      newSocket.disconnect();
      dispatch(setSocket(null));
    };
  }, [userData, socket, dispatch]);

  // 🔹 Filter users and mark online
  const filteredUsers = otherUsers?.map(user => ({
    ...user,
    isOnline: onlineUsers?.includes(user._id.toString())
  })).filter(user => {
    if (!query) return true;
    return (
      user.name?.toLowerCase().includes(query.toLowerCase()) ||
      user.userName?.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <div
      className={`lg:w-[30%] w-full h-full lg:block bg-slate-200 overflow-hidden 
      ${!selectedUser ? "block" : "hidden"}`}
    >
      {/* Logout Button */}
      <div
        className='w-[60px] h-[60px] mt-[10px] rounded-full overflow-hidden
        bg-[#19cdff] flex justify-center items-center cursor-pointer shadow-gray-500
        shadow-lg fixed bottom-[20px] left-[10px] z-20'
      >
        <BiLogOutCircle className='w-[25px] h-[25px]' onClick={handleLogout} />
      </div>

      {/* Header */}
      <div className='w-full h-[300px] bg-[#19cdff] rounded-b-[30%] shadow-gray-400 shadow-lg flex flex-col justify-center px-[20px]'>
        <h1 className='text-white font-bold text-[25px]'>TalkSy</h1>

        <div className='w-full flex justify-between items-center mt-2'>
          <h1 className='text-gray-800 font-bold text-[22px] truncate'>
            Hi, {userData?.name || "User"}
          </h1>

          <div
            className='w-[60px] h-[60px] bg-white rounded-full overflow-hidden flex justify-center items-center shadow-gray-500 shadow-lg cursor-pointer'
            onClick={() => navigate("/profile")}
          >
            <img
              src={userData?.image || dp}
              alt=""
              className='w-full h-full object-cover'
            />
          </div>
        </div>

        {/* Search + small avatars */}
        <div className='w-full flex items-center gap-[15px] flex-wrap mt-[10px]'>
          {!search ? (
            <div
              className='w-[60px] h-[60px] rounded-full overflow-hidden bg-white flex justify-center items-center cursor-pointer shadow-gray-500 shadow-lg'
              onClick={() => setSearch(true)}
            >
              <IoIosSearch className='w-[25px] h-[25px]' />
            </div>
          ) : (
            <form
              className='w-full h-[60px] bg-white shadow-gray-500 shadow-xl flex items-center gap-[10px] mt-[10px] rounded-full overflow-hidden px-[20px]'
              onSubmit={(e) => e.preventDefault()}
            >
              <IoIosSearch className='w-[25px] h-[25px]' />
              <input
                type="text"
                placeholder='Search users...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className='w-full h-full p-[10px] text-[17px] outline-none border-none'
              />
              <RxCross2
                className='w-[25px] h-[25px] cursor-pointer'
                onClick={() => {
                  setSearch(false);
                  setQuery("");
                }}
              />
            </form>
          )}

          {/* Small avatar previews (clickable) */}
          {/* Small avatar previews (clickable) — only online users */}
          {!search && (
            <div className="flex items-center gap-[10px] flex-wrap overflow-x-auto max-w-full">
              {filteredUsers
                ?.filter(user => user.isOnline) // ✅ Only include online users
                .map((user) => (
                  <div
                    key={user._id}
                    className='relative w-[50px] h-[50px] bg-white rounded-full overflow-hidden flex justify-center items-center shadow-gray-500 shadow-md cursor-pointer'
                    onClick={() => dispatch(setSelectedUser(user))}
                  >
                    <img
                      src={user.image || dp}
                      alt=""
                      className='w-full h-full object-cover'
                    />
                    <div
                      className='absolute bottom-[2px] right-[2px] w-[10px] h-[10px] bg-green-500 rounded-full border-[2px] border-white'
                      title='Online'
                    ></div>
                  </div>
                ))}
            </div>
          )}

        </div>
      </div>

      {/* Main User List */}
      <div className='w-full h-[60vh] overflow-y-auto flex flex-col gap-[15px] items-center mt-[20px] px-[10px] pb-[80px]'>
        {filteredUsers?.map((user) => (
          <div
            key={user._id}
            onClick={() => dispatch(setSelectedUser(user))}
            className='relative w-full max-w-[95%] h-[70px] flex items-center gap-[15px] shadow-gray-400 shadow-md bg-white rounded-full hover:bg-[#b2ccdf] cursor-pointer transition-all duration-200'
          >
            <div className='relative w-[60px] h-[60px] bg-white rounded-full overflow-hidden flex justify-center items-center shadow-gray-400 shadow-md ml-[10px]'>
              <img
                src={user.image || dp}
                alt=""
                className='w-full h-full object-cover'
              />
              {user.isOnline && (
                <div className='absolute bottom-[4px] right-[4px] w-[12px] h-[12px] bg-green-500 rounded-full border-[2px] border-white'></div>
              )}
            </div>
            <h1 className='text-gray-800 font-semibold text-[18px] truncate pr-[15px]'>
              {user.name || user.userName}
            </h1>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
