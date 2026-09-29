import SwapRequest from "../models/SwapRequest.js";
import Notification from "../models/Notification.js";
import Chat from "../models/Chat.js";

// @desc    Send a new skill swap request
// @route   POST /api/requests
// @access  Private
export const sendRequest = async (req, res) => {
  try {
    const { receiverId, offeredSkill, wantedSkill, note } = req.body;

    if (!receiverId || !offeredSkill || !wantedSkill) {
      return res.status(400).json({ success: false, message: "Receiver ID, offered skill, and wanted skill are required" });
    }

    if (receiverId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot send a request to yourself" });
    }

    // Check if pending request already exists
    const existingReq = await SwapRequest.findOne({
      sender: req.user._id,
      receiver: receiverId,
      status: "pending",
    });

    if (existingReq) {
      return res.status(400).json({ success: false, message: "A pending swap request already exists for this user" });
    }

    const newRequest = await SwapRequest.create({
      sender: req.user._id,
      receiver: receiverId,
      offeredSkill,
      wantedSkill,
      note: note || "",
    });

    // Create notification for receiver
    await Notification.create({
      recipient: receiverId,
      sender: req.user._id,
      type: "request",
      title: "New Skill Swap Request",
      message: `${req.user.name} wants to swap ${offeredSkill} for ${wantedSkill}!`,
      link: "/requests",
    });

    res.status(201).json({ success: true, request: newRequest, message: "Swap request sent successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's incoming and outgoing swap requests
// @route   GET /api/requests
// @access  Private
export const getRequests = async (req, res) => {
  try {
    const incoming = await SwapRequest.find({ receiver: req.user._id })
      .populate("sender", "name email college course year avatar teachSkills learnSkills")
      .sort({ createdAt: -1 });

    const outgoing = await SwapRequest.find({ sender: req.user._id })
      .populate("receiver", "name email college course year avatar teachSkills learnSkills")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      incoming,
      outgoing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Respond to swap request (accept or reject)
// @route   PUT /api/requests/:id
// @access  Private
export const respondToRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'accepted' or 'rejected'" });
    }

    const swapReq = await SwapRequest.findById(req.params.id);

    if (!swapReq) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (swapReq.receiver.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Not authorized to modify this request" });
    }

    swapReq.status = status;
    await swapReq.save();

    // If accepted, ensure a chat conversation exists between the two users
    let chat = null;
    if (status === "accepted") {
      chat = await Chat.findOne({
        participants: { $all: [swapReq.sender, swapReq.receiver] },
      });

      if (!chat) {
        chat = await Chat.create({
          participants: [swapReq.sender, swapReq.receiver],
        });
      }

      // Notify sender that request was accepted
      await Notification.create({
        recipient: swapReq.sender,
        sender: req.user._id,
        type: "accepted",
        title: "Swap Request Accepted! 🎉",
        message: `${req.user.name} accepted your skill swap request! You can now start chatting.`,
        link: `/chat/${chat._id}`,
      });
    } else {
      // Notify sender of rejection
      await Notification.create({
        recipient: swapReq.sender,
        sender: req.user._id,
        type: "rejected",
        title: "Swap Request Declined",
        message: `${req.user.name} declined your skill swap request.`,
        link: "/matches",
      });
    }

    res.json({
      success: true,
      request: swapReq,
      chatId: chat ? chat._id : null,
      message: `Request ${status} successfully!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
