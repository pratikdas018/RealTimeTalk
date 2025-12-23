import React, { useEffect, useRef, useState } from "react";
import dp from "../assets/dp.webp";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/userSlice";
import { RiEmojiStickerLine } from "react-icons/ri";
import { FaImages } from "react-icons/fa6";
import { RiSendPlane2Fill } from "react-icons/ri";
import EmojiPicker from "emoji-picker-react";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import axios from "axios";
import { serverUrl } from "../main";
import {
  setMessages,
  clearMessages,
  addMessage,
  updateSeenMessages,
} from "../redux/messageSlice";

function MessageArea() {
  const { selectedUser, userData, socket, onlineUsers } = useSelector(
    (state) => state.user
  );
  const { messages } = useSelector((state) => state.message);
  const dispatch = useDispatch();

  const [showPicker, setShowPicker] = useState(false);
  const [input, setInput] = useState("");
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const image = useRef();

  /* ================= FETCH MESSAGES ================= */
  useEffect(() => {
    if (!selectedUser?._id) return;

    dispatch(clearMessages());

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/message/${selectedUser._id}`,
          { withCredentials: true }
        );
        dispatch(setMessages(res.data));

        await axios.put(
          `${serverUrl}/api/message/seen/${selectedUser._id}`,
          {},
          { withCredentials: true }
        );
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };

    fetchMessages();
  }, [selectedUser?._id, dispatch]);

  /* ================= SEND MESSAGE ================= */
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input && !backendImage) return;

    try {
      const formData = new FormData();
      formData.append("message", input);
      if (backendImage) formData.append("image", backendImage);

      const res = await axios.post(
        `${serverUrl}/api/message/send/${selectedUser._id}`,
        formData,
        { withCredentials: true }
      );

      dispatch(addMessage(res.data)); // ✅ instant UI update
      setInput("");
      setFrontendImage(null);
      setBackendImage(null);
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  /* ================= EMOJI ================= */
  const onEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
    setShowPicker(false);
  };

  /* ================= SOCKET EVENTS ================= */
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg) => {
      dispatch(addMessage(msg));
    };

    const onMessagesSeen = ({ receiver }) => {
      dispatch(updateSeenMessages(receiver));
    };

    socket.on("newMessage", onNewMessage);
    socket.on("messagesSeen", onMessagesSeen);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("messagesSeen", onMessagesSeen);
    };
  }, [socket, dispatch]);

  return (
    <div
      className={`lg:w-[70%] ${
        selectedUser ? "flex" : "hidden"
      } w-full h-full bg-slate-200 border-l-2 border-gray-300`}
    >
      {selectedUser ? (
        <div className="w-full h-[100vh] flex flex-col">
          {/* HEADER */}
          <div className="w-full h-[100px] bg-[#1797c2] rounded-b-[30px] shadow-lg flex items-center px-5 gap-5">
            <IoIosArrowRoundBack
              className="w-10 h-10 text-white cursor-pointer"
              onClick={() => dispatch(setSelectedUser(null))}
            />

            <div className="relative w-[50px] h-[50px] rounded-full overflow-hidden bg-white">
              <img
                src={selectedUser.avatar || dp}
                className="w-full h-full object-cover"
              />
              {onlineUsers?.includes(selectedUser._id) && (
                <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>

            <h1 className="text-white text-xl font-semibold">
              {selectedUser.fullName || "User"}
            </h1>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-auto px-5 py-6 pb-[140px] flex flex-col gap-4">
            {showPicker && (
              <div className="absolute bottom-[120px] left-5 z-50">
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}

            {Array.isArray(messages) &&
              messages.map((m) =>
                m.sender === userData._id ? (
                  <SenderMessage key={m._id} {...m} />
                ) : (
                  <ReceiverMessage key={m._id} {...m} />
                )
              )}
          </div>
        </div>
      ) : null}

      {/* INPUT */}
      {selectedUser && (
        <div className="fixed bottom-5 w-full lg:w-[70%] flex justify-center">
          <form
            onSubmit={handleSendMessage}
            className="w-[95%] lg:w-[70%] h-[60px] bg-[#1797c2] rounded-full flex items-center gap-3 px-5 shadow-lg"
          >
            <RiEmojiStickerLine
              onClick={() => setShowPicker((p) => !p)}
              className="text-white text-2xl cursor-pointer"
            />

            <input
              type="file"
              hidden
              ref={image}
              accept="image/*"
              onChange={handleImage}
            />

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message"
              className="flex-1 bg-transparent text-white outline-none placeholder-white"
            />

            <FaImages
              className="text-white text-xl cursor-pointer"
              onClick={() => image.current.click()}
            />

            {(input || backendImage) && (
              <RiSendPlane2Fill
                onClick={handleSendMessage}
                className="text-white text-xl cursor-pointer"
              />
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export default MessageArea;
