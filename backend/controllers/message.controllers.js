import uploadOnCloudinary from "../config/cloudinary.js"
import Conversation from "../models/conversation.model.js"
import Message from "../models/message.model.js"
import { getReceiverSocketId, io } from "../socket/socket.js"

export const sendMessage = async (req,res) => {
    try {
        let sender = req.userId
        let {receiver} = req.params
        let {message} = req.body


        let image
        if(req.file){
            image = await uploadOnCloudinary(req.file.path)
        }

        let conversation = await Conversation.findOne({
            participants:{$all:[sender,receiver]}
        })


        let newMessage = await Message.create({
            sender,receiver,message,image
        })


        if(!conversation){
            conversation = await Conversation.create({
                participants:[sender,receiver],
                message:[newMessage._id]
            })
        } else{
            conversation.messages.push(newMessage._id)
            await conversation.save()
        }

        const receiverSocketId = getReceiverSocketId(receiver)
        const senderSocketId = getReceiverSocketId(sender)

        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }
        if(senderSocketId) io.to(senderSocketId).emit("newMessage", newMessage)

        return res.status(201).json(newMessage)

    } catch (error) {
        return res.status(500).json({message:`send message error ${error}`})
    }
}

export const markMessagesAsSeen = async (req, res) => {
  try {
    const sender = req.userId;
    const { receiver } = req.params;

    const conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] }
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Mark all messages from receiver → sender as seen
    await Message.updateMany(
      { sender: receiver, receiver: sender, seen: false },
      { $set: { seen: true } }
    );

    // Notify the sender (so they can update tick color)
    const receiverSocketId = getReceiverSocketId(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messagesSeen", { receiver: sender });
    }

    return res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    return res.status(500).json({ message: `Mark seen error ${error}` });
  }
};


export const getMessages = async (req,res) => {
        let sender = req.userId
        let {receiver} = req.params
    try {
        let conversation = await Conversation.findOne({
            participants:{$all:[sender,receiver]}
        }).populate("messages")

        if(!conversation){
            return res.status(400).json({message:"conversation not found"})
        }


        return res.status(200).json(conversation?.messages)
    } catch (error) {
        return res.status(500).json({message:`get message error ${error}`})
    }
}