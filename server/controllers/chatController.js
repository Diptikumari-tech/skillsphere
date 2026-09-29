import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";

// @desc    Get user's active chat conversations
// @route   GET /api/chats
// @access  Private
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate("participants", "name email avatar college course")
      .sort({ updatedAt: -1 });

    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages for a specific chat
// @route   GET /api/chats/:chatId/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat conversation not found" });
    }

    const isParticipant = chat.participants.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Not authorized to view this chat" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email avatar")
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message in a chat
// @route   POST /api/chats/:chatId/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text cannot be empty" });
    }

    const chat = await Chat.findById(chatId);
    const isParticipant = chat.participants.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Not authorized to send message in this chat" });
    }

    const receiverId = chat.participants.find(
      (id) => id.toString() !== req.user._id.toString()
    );

    const message = await Message.create({
      chat: chatId,
      sender: req.user._id,
      receiver: receiverId,
      text,
    });

    chat.lastMessage = {
      text,
      sender: req.user._id,
      createdAt: new Date(),
    };
    await chat.save();

    const populatedMessage = await Message.findById(message._id).populate("sender", "name email avatar");

    // Notification for message receiver
    if (receiverId) {
      await Notification.create({
        recipient: receiverId,
        sender: req.user._id,
        type: "chat",
        title: `New message from ${req.user.name}`,
        message: text.length > 50 ? `${text.substring(0, 50)}...` : text,
        link: `/chat/${chatId}`,
      });
    }

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
