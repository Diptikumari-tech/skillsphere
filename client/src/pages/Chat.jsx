import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { socket } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import "./Chat.css";

function Chat() {
  const { chatId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  // Online Users & Typing
  const [onlineUsersList, setOnlineUsersList] = useState([]);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Modal State for scheduling video session inside chat
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sessionTopic, setSessionTopic] = useState("Skill Swap Workshop");
  const [scheduledDate, setScheduledDate] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState("");

  const messagesEndRef = useRef(null);

  // Load all user chats
  const fetchChats = async () => {
    try {
      const res = await api.get("/chats");
      if (res.data && res.data.success) {
        setChats(res.data.chats || []);
        if (chatId && chatId !== "active") {
          const found = res.data.chats.find((c) => c._id === chatId);
          if (found) setActiveChat(found);
        } else if (res.data.chats.length > 0) {
          setActiveChat(res.data.chats[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [chatId]);

  // Socket online users setup
  useEffect(() => {
    if (socket) {
      const handleOnlineUsers = (users) => {
        setOnlineUsersList(users || []);
      };

      socket.on("online_users", handleOnlineUsers);
      return () => {
        socket.off("online_users", handleOnlineUsers);
      };
    }
  }, []);

  // Load messages & handle socket events for active chat
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chats/${activeChat._id}/messages`);
        if (res.data && res.data.success) {
          setMessages(res.data.messages || []);
        }
      } catch (err) {
        console.error("Error loading chat messages:", err);
      }
    };

    fetchMessages();

    // Socket.io room join
    if (socket) {
      socket.emit("join_chat", activeChat._id);

      const handleIncomingMessage = (msg) => {
        const msgChatId = typeof msg.chat === "object" ? msg.chat._id : msg.chat;
        if (msgChatId === activeChat._id) {
          setMessages((prev) => [...prev, msg]);
        }
      };

      const handleTyping = (data) => {
        const targetChatId = typeof data === "string" ? data : data.chatId;
        if (targetChatId === activeChat._id) {
          setIsPeerTyping(true);
        }
      };

      const handleStopTyping = (data) => {
        const targetChatId = typeof data === "string" ? data : data.chatId;
        if (targetChatId === activeChat._id) {
          setIsPeerTyping(false);
        }
      };

      socket.on("message_received", handleIncomingMessage);
      socket.on("typing", handleTyping);
      socket.on("stop_typing", handleStopTyping);

      return () => {
        socket.emit("leave_chat", activeChat._id);
        socket.off("message_received", handleIncomingMessage);
        socket.off("typing", handleTyping);
        socket.off("stop_typing", handleStopTyping);
      };
    }
  }, [activeChat]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPeerTyping]);

  const handleInputChange = (e) => {
    setText(e.target.value);

    if (socket && activeChat) {
      socket.emit("typing", { chatId: activeChat._id, senderId: currentUser._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", { chatId: activeChat._id, senderId: currentUser._id });
      }, 2000);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (socket) socket.emit("stop_typing", { chatId: activeChat._id, senderId: currentUser._id });

    const currentText = text;
    setText("");

    try {
      const res = await api.post(`/chats/${activeChat._id}/messages`, { text: currentText });
      if (res.data && res.data.success) {
        const newMsg = res.data.message;
        setMessages((prev) => [...prev, newMsg]);

        if (socket) {
          socket.emit("new_message", newMsg);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleScheduleSession = async (e) => {
    e.preventDefault();
    if (!activeChat || !scheduledDate) return;

    const peer = activeChat.participants.find((p) => p._id !== currentUser._id);
    if (!peer) return;

    try {
      setScheduling(true);
      setScheduleSuccessMsg("");

      const meetingLink = `https://meet.jit.si/skillsphere-${Date.now()}`;

      const res = await api.post("/sessions", {
        participantId: peer._id,
        topic: sessionTopic,
        scheduledDate,
        durationMinutes: Number(durationMinutes),
        meetingLink,
      });

      if (res.data && res.data.success) {
        setScheduleSuccessMsg("🎉 Video call session scheduled!");
        const meetingMsg = `📹 Scheduled video session: "${sessionTopic}" on ${new Date(
          scheduledDate
        ).toLocaleString()}. Join link: /session/${res.data.session._id}`;

        await api.post(`/chats/${activeChat._id}/messages`, { text: meetingMsg });
        setTimeout(() => setShowScheduleModal(false), 1500);
      }
    } catch (err) {
      console.error("Error scheduling session:", err);
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return (
      <div className="chat-loading glass-card">
        <div className="loader"></div>
        <h2>Loading Messenger...</h2>
      </div>
    );
  }

  const peerUser = activeChat?.participants?.find((p) => p._id !== currentUser._id);
  const isPeerOnline = peerUser ? onlineUsersList.includes(peerUser._id) : false;

  return (
    <div className="messenger-container glass-card">
      {/* LEFT CONVERSATION SIDEBAR */}
      <div className="messenger-sidebar">
        <div className="sidebar-header">
          <h2>💬 Conversations</h2>
          <span className="count-badge">{chats.length}</span>
        </div>

        <div className="chats-list">
          {chats.length === 0 ? (
            <div className="no-chats-msg">
              <p>No active chats yet. Accept a swap request to start chatting!</p>
            </div>
          ) : (
            chats.map((c) => {
              const other = c.participants?.find((p) => p._id !== currentUser._id);
              const isSelected = activeChat?._id === c._id;
              const isOtherOnline = other ? onlineUsersList.includes(other._id) : false;

              return (
                <div
                  key={c._id}
                  className={`chat-thumb-item ${isSelected ? "selected" : ""}`}
                  onClick={() => setActiveChat(c)}
                >
                  <Avatar
                    src={other?.avatar}
                    name={other?.name}
                    size="md"
                    isOnline={isOtherOnline}
                    showStatus={true}
                  />
                  <div className="chat-thumb-info">
                    <div className="thumb-top">
                      <h4>{other?.name || "Peer Partner"}</h4>
                    </div>
                    <p className="thumb-last-msg">
                      {c.lastMessage?.text || "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT MAIN MESSAGING PANE */}
      <div className="messenger-main">
        {activeChat ? (
          <>
            {/* CHAT HEADER */}
            <div className="chat-header">
              <div className="peer-info">
                <Avatar
                  src={peerUser?.avatar}
                  name={peerUser?.name}
                  size="md"
                  isOnline={isPeerOnline}
                  showStatus={true}
                />
                <div>
                  <h3>{peerUser?.name || "Peer Learner"}</h3>
                  <span className={`online-indicator ${isPeerOnline ? "is-online" : ""}`}>
                    {isPeerOnline ? "🟢 Online" : "⚪ Offline"}
                  </span>
                </div>
              </div>

              <button
                className="btn-primary btn-sm"
                onClick={() => setShowScheduleModal(true)}
              >
                📹 Schedule Call
              </button>
            </div>

            {/* MESSAGE STREAM */}
            <div className="message-stream">
              {messages.length === 0 ? (
                <div className="empty-chat-state">
                  <span>👋</span>
                  <p>Start your skill swap conversation with {peerUser?.name}!</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = (m.sender?._id || m.sender) === currentUser._id;
                  return (
                    <div
                      key={m._id}
                      className={`message-bubble-wrapper ${isMe ? "me" : "peer"}`}
                    >
                      <div className="message-bubble">
                        <span className="sender-label">
                          {isMe ? "You" : m.sender?.name || "Peer"}
                        </span>
                        <p>{m.text}</p>
                        <small className="time-label">
                          {new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>
                    </div>
                  );
                })
              )}

              {isPeerTyping && (
                <div className="message-bubble-wrapper peer">
                  <div className="typing-indicator-bubble">
                    <span>typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* MESSAGE INPUT FORM */}
            <form onSubmit={handleSend} className="chat-input-form">
              <input
                type="text"
                placeholder="Type your message here..."
                value={text}
                onChange={handleInputChange}
              />
              <button type="submit" className="btn-primary">
                Send 🚀
              </button>
            </form>
          </>
        ) : (
          <div className="no-active-chat glass-card">
            <span>💬</span>
            <h3>Select a conversation to start chatting</h3>
          </div>
        )}
      </div>

      {/* SCHEDULE VIDEO CALL MODAL DIALOG */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📹 Schedule Video Session</h2>
              <button className="close-btn" onClick={() => setShowScheduleModal(false)}>
                ×
              </button>
            </div>

            {scheduleSuccessMsg && <div className="schedule-alert">{scheduleSuccessMsg}</div>}

            <form onSubmit={handleScheduleSession} className="schedule-form">
              <div className="form-group">
                <label>Workshop Topic:</label>
                <input
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date & Time:</label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Duration:</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={scheduling} className="btn-primary">
                  {scheduling ? "Scheduling..." : "Schedule Call 📹"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;