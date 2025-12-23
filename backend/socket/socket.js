import http from "http";
import express from "express";
import { Server } from "socket.io";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const userSocketMap = {}; // store userId => socketId

export const getReceiverSocketId = (receiver) => {
  return userSocketMap[receiver];
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ✅ Send Message
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
        // mark as delivered if receiver is online
        newMessage.status = "delivered";
        await newMessage.save();
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }

      // sender confirmation
      io.to(socket.id).emit("messageSent", newMessage);
    } catch (error) {
      console.error("Socket sendMessage error:", error.message);
    }
  });

  // ✅ Mark Messages as Seen
  socket.on("markAsSeen", async ({ senderId, receiverId }) => {
    try {
      await Message.updateMany(
        { sender: senderId, receiver: receiverId, status: { $ne: "seen" } },
        { $set: { status: "seen" } }
      );

      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesSeen", { receiverId });
      }
    } catch (error) {
      console.error("Socket markAsSeen error:", error.message);
    }
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io };
