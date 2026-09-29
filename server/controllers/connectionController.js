import SwapRequest from "../models/SwapRequest.js";
import Chat from "../models/Chat.js";

// @desc    Get user's active connections (accepted swap requests with partner details)
// @route   GET /api/connections
// @access  Private
export const getConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all accepted swap requests where user is sender or receiver
    const acceptedRequests = await SwapRequest.find({
      $or: [
        { sender: userId, status: "accepted" },
        { receiver: userId, status: "accepted" },
      ],
    })
      .populate("sender", "name email avatar college course year teachSkills learnSkills rating bio location")
      .populate("receiver", "name email avatar college course year teachSkills learnSkills rating bio location")
      .sort({ updatedAt: -1 });

    // Fetch user chats to associate chat ID & last message with each connection
    const userChats = await Chat.find({
      participants: userId,
    }).populate("participants", "name email avatar");

    const connectionsMap = new Map();

    for (const reqObj of acceptedRequests) {
      const isSender = reqObj.sender._id.toString() === userId.toString();
      const partner = isSender ? reqObj.receiver : reqObj.sender;

      if (!partner || !partner._id) continue;

      const partnerIdStr = partner._id.toString();

      if (!connectionsMap.has(partnerIdStr)) {
        // Find chat with this partner
        const chat = userChats.find((c) =>
          c.participants.some((p) => p._id.toString() === partnerIdStr)
        );

        connectionsMap.set(partnerIdStr, {
          connectionId: reqObj._id,
          user: partner,
          offeredSkill: isSender ? reqObj.offeredSkill : reqObj.wantedSkill,
          wantedSkill: isSender ? reqObj.wantedSkill : reqObj.offeredSkill,
          createdAt: reqObj.updatedAt || reqObj.createdAt,
          chatId: chat ? chat._id : null,
          lastMessage: chat ? chat.lastMessage : null,
        });
      }
    }

    const connections = Array.from(connectionsMap.values());

    res.json({
      success: true,
      count: connections.length,
      connections,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
