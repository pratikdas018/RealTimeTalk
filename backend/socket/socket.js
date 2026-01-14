import http from "http";
import express from "express";
import { Server } from "socket.io";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://realtimetalk-frontend.onrender.com",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; // userId => socketId

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ Send message
  socket.on("sendMessage", async (data) => {
    try {
      const { sender, receiver, message, image } = data;

      const newMessage = await Message.create({
        sender,
        receiver,
        message,
        image,
        status: "sent",
      });

      const receiverSocketId = userSocketMap[receiver];

      if (receiverSocketId) {
        newMessage.status = "delivered";
        await newMessage.save();

        io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      io.to(socket.id).emit("messageSent", newMessage);
    } catch (error) {
      console.error("Socket sendMessage error:", error);
    }
  });

  // ✅ Mark messages as seen
  socket.on("markAsSeen", async ({ senderId, receiverId }) => {
    try {
      await Message.updateMany(
        {
          sender: senderId,
          receiver: receiverId,
          status: { $ne: "seen" },
        },
        { $set: { status: "seen" } }
      );

      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", { receiverId });
      }
    } catch (error) {
      console.error("Socket markAsSeen error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);

    if (userId) {
      delete userSocketMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io };
