import Session from "../models/Session.js";
import Notification from "../models/Notification.js";

// @desc    Schedule a new learning session
// @route   POST /api/sessions
// @access  Private
export const scheduleSession = async (req, res) => {
  try {
    const { participantId, topic, scheduledDate, durationMinutes, meetingLink, notes } = req.body;

    if (!participantId || !topic || !scheduledDate) {
      return res.status(400).json({ success: false, message: "Participant, topic, and date are required" });
    }

    const session = await Session.create({
      host: req.user._id,
      participant: participantId,
      topic,
      scheduledDate,
      durationMinutes: durationMinutes || 45,
      meetingLink: meetingLink || `https://meet.jit.si/skillsphere-${Date.now()}`,
      notes: notes || "",
    });

    await Notification.create({
      recipient: participantId,
      sender: req.user._id,
      type: "session",
      title: "New Session Scheduled",
      message: `${req.user.name} scheduled a learning session on "${topic}" with you!`,
      link: "/sessions",
    });

    res.status(201).json({ success: true, session, message: "Session scheduled successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's sessions (scheduled or completed)
// @route   GET /api/sessions
// @access  Private
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ host: req.user._id }, { participant: req.user._id }],
    })
      .populate("host", "name email avatar college course")
      .populate("participant", "name email avatar college course")
      .sort({ scheduledDate: 1 });

    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single session details by ID
// @route   GET /api/sessions/:id
// @access  Private
export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate("host", "name email avatar college course year teachSkills learnSkills rating")
      .populate("participant", "name email avatar college course year teachSkills learnSkills rating");

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    const isAuthorized =
      session.host._id.toString() === req.user._id.toString() ||
      session.participant._id.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "Not authorized to access this video session" });
    }

    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update session status (completed or cancelled)
// @route   PUT /api/sessions/:id
// @access  Private
export const updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (
      session.host.toString() !== req.user._id.toString() &&
      session.participant.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ success: false, message: "Not authorized to update this session" });
    }

    session.status = status;
    await session.save();

    res.json({ success: true, session, message: `Session status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
