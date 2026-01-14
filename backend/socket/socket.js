import { Server } from "socket.io";
import Message from "../models/message.model.js";

let io;
const userSocketMap = {}; // userId => socketId

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://realtimetalk-frontend.onrender.com",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

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
      } catch (err) {
        console.error("sendMessage error:", err);
      }
    });

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
      } catch (err) {
        console.error("markAsSeen error:", err);
      }
    });

    socket.on("disconnect", () => {
      if (userId) delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

export const getReceiverSocketId = (receiverId) =>
  userSocketMap[receiverId];
// ADD BELOW existing code in socket.js

export const emitToSocket = (socketId, event, payload) => {
  if (!io) return;
  io.to(socketId).emit(event, payload);
};
