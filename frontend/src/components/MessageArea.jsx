import React, { useEffect, useRef, useState } from 'react'
import dp from '../assets/dp.webp'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedUser } from '../redux/userSlice';
import { RiEmojiStickerLine } from "react-icons/ri";
import { FaImages } from "react-icons/fa6";
import { RiSendPlane2Fill } from "react-icons/ri";
import EmojiPicker from 'emoji-picker-react';
import SenderMessage from './SenderMessage';
import ReceiverMessage from './ReceiverMessage';
import axios from 'axios';
import { serverUrl } from '../main';
import { setMessages, clearMessages } from '../redux/messageSlice';

function MessageArea() {
  let { selectedUser, userData, socket, onlineUsers } = useSelector(state => state.user);
  let { messages } = useSelector(state => state.message);
  let dispatch = useDispatch();

  let [showPicker, setShowPicker] = useState(false);
  let [input, setInput] = useState("");
  let [frontendImage, setFrontendImage] = useState(null);
  let [backendImage, setBackendImage] = useState(null);
  let image = useRef();

  // ✅ Step 1: Fetch messages whenever selectedUser changes
  useEffect(() => {
    if (!selectedUser) return;

    dispatch(clearMessages());

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/message/${selectedUser._id}`, {
          withCredentials: true
        });
        dispatch(setMessages(res.data));
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
  }, [selectedUser, dispatch]);

  // ✅ Step 2: Sending messages
  const handleImage = (e) => {
    let file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.length === 0 && backendImage == null) return;

    try {
      let formData = new FormData();
      formData.append("message", input);
      if (backendImage) formData.append("image", backendImage);

      let result = await axios.post(`${serverUrl}/api/message/send/${selectedUser._id}`, formData, { withCredentials: true });

      dispatch(setMessages([...messages, result.data]));

      setInput("");
      setFrontendImage(null);
      setBackendImage(null);
    } catch (error) {
      console.log(error);
    }
  };

  const onEmojiClick = (emojiData) => {
    setInput((prevInput) => prevInput + emojiData.emoji);
    setShowPicker(false);
  };

  useEffect(() => {
    socket.on("newMessage", (mess) => {
      dispatch(setMessages([...messages, mess]))
    })
    return () => socket.off("newMessage")
  }, [messages, setMessages])

  return (
    <div className={`lg:w-[70%] relative ${selectedUser ? "flex" : "hidden"} lg:flex w-full h-full bg-slate-200 border-l-2 border-gray-300`}>
      {selectedUser ? (
        <div className='w-full h-[100vh] flex flex-col'>
          {/* Header */}
          <div className='w-full h-[100px] bg-[#1797c2] rounded-b-[30px] shadow-gray-400 shadow-lg flex items-center px-[20px] gap-[20px]'>
            <div className='cursor-pointer' onClick={() => dispatch(setSelectedUser(null))}>
              <IoIosArrowRoundBack className='w-[40px] h-[40px] text-white' />
            </div>

            {/* ✅ Selected User Avatar with Green Online Dot */}
            <div className='relative w-[50px] h-[50px] bg-white rounded-full overflow-hidden flex justify-center items-center shadow-gray-500 shadow-lg cursor-pointer'>
              <img src={selectedUser?.image || dp} alt="" className='h-[100%]' />
              {onlineUsers?.includes(selectedUser?._id) && (
                <div className='absolute bottom-[2px] right-[2px] w-[10px] h-[10px] bg-green-500 rounded-full border-[2px] border-white'></div>
              )}
            </div>

            <h1 className='text-white font-semibold text-[20px]'>{selectedUser?.name || "User"}</h1>
          </div>

          {/* Chat messages */}
          <div className='w-full flex flex-col py-[30px] px-[20px] overflow-auto pb-[120px] gap-[20px]'>
            {showPicker && (
              <div className='absolute bottom-[120px] left-[20px]'>
                <EmojiPicker width={250} height={350} className='shadow-lg z-[100]' onEmojiClick={onEmojiClick} />
              </div>
            )}

            {messages?.map((mess) =>
              mess.sender === userData._id ? (
                <SenderMessage key={mess._id} image={mess.image} message={mess.message} />
              ) : (
                <ReceiverMessage key={mess._id} image={mess.image} message={mess.message} />
              )
            )}
          </div>
        </div>
      ) : (
        <div className='w-full h-full flex flex-col justify-center items-center'>
          <h1 className='text-gray-700 font-bold text-[50px]'>Welcome to TalkSy</h1>
          <span className='text-gray-700 font-semibold text-[30px]'>Chat easily!</span>
        </div>
      )}

      {/* Message input */}
      {selectedUser && (
        <div className='w-full lg:w-[70%] h-[100px] fixed bottom-[20px] flex items-center justify-center'>
          {frontendImage && (
            <img
              src={frontendImage}
              alt=""
              className='w-[80px] absolute bottom-[100px] right-[20%] 
              rounded-lg shadow-gray-400 shadow-lg'
            />
          )}

          <form
            className='w-[95%] lg:w-[70%] h-[60px] bg-[rgb(23,151,194)] shadow-gray-400 shadow-lg 
             rounded-full flex items-center justify-between gap-3 px-4 sm:px-6 md:px-8'
            onSubmit={handleSendMessage}
          >
            <button
              type="button"
              onClick={() => setShowPicker(prev => !prev)}
              className="flex items-center justify-center p-2 hover:opacity-80 transition"
            >
              <RiEmojiStickerLine className='w-[24px] h-[24px] text-white cursor-pointer' />
            </button>

            <input
              type="file"
              accept='image/*'
              ref={image}
              hidden
              onChange={handleImage}
            />

            <input
              type="text"
              className='flex-1 h-full text-[17px] text-white bg-transparent placeholder-white 
               outline-none border-0 px-2 sm:px-3'
              placeholder='Message'
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />

            <button
              type="button"
              onClick={() => image.current.click()}
              className="flex items-center justify-center p-2 hover:opacity-80 transition"
            >
              <FaImages className='w-[24px] h-[24px] text-white cursor-pointer' />
            </button>

            {(input.length > 0 || backendImage != null) && (
              <button
                type="submit"
                className="flex items-center justify-center p-2 pr-1 hover:opacity-80 transition"
              >
                <RiSendPlane2Fill className='w-[24px] h-[24px] text-white cursor-pointer' />
              </button>
            )}

          </form>
        </div>
      )}
    </div>
  );
}

export default MessageArea;
