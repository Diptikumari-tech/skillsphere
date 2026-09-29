import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import "./SessionDetail.css";

function SessionDetail() {
  const { sessionId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/sessions/${sessionId}`);
        if (res.data && res.data.success) {
          setSession(res.data.session);
        }
      } catch (err) {
        console.error("Error loading session:", err);
        setError(err.response?.data?.message || "Failed to load session details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  // Live countdown timer calculation
  useEffect(() => {
    if (!session || !session.scheduledDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(session.scheduledDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown("Session Time! Available to Join Now 🚀");
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown(`Starts in ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await api.put(`/sessions/${sessionId}`, { status: newStatus });
      if (res.data && res.data.success) {
        setSession((prev) => ({ ...prev, status: newStatus }));
        if (newStatus === "completed") {
          setIsJoined(false);
        }
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.response?.data?.message || "Failed to update session status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="session-detail-loading glass-card">
        <div className="loader"></div>
        <h2>Loading Learning Room...</h2>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="session-detail-error glass-card">
        <h2>⚠️ Session Error</h2>
        <p>{error || "Session not found."}</p>
        <Link to="/sessions" className="btn-secondary">
          ← Back to Sessions
        </Link>
      </div>
    );
  }

  const isHost = session.host?._id === currentUser._id;
  const peer = isHost ? session.participant : session.host;
  const teacher = isHost ? session.host : session.participant;
  const learner = isHost ? session.participant : session.host;

  // Build clean unique Jitsi room link
  const jitsiRoomName = `skillsphere-room-${session._id}`;
  const jitsiUrl = `https://meet.jit.si/${jitsiRoomName}#userInfo.displayName="${encodeURIComponent(
    currentUser.name
  )}"&config.prejoinPageEnabled=false`;

  return (
    <div className="session-detail-container">
      {/* HEADER CARD */}
      <section className="session-header-card glass-card">
        <div className="header-top">
          <Link to="/sessions" className="back-link">
            ← Back to All Sessions
          </Link>
          <span className={`status-badge status-${session.status}`}>
            {session.status.toUpperCase()}
          </span>
        </div>

        <h1>📹 {session.topic}</h1>
        <p className="session-subtitle">
          Interactive Browser-Based Peer Workshop • WebRTC Encrypted Stream
        </p>

        {/* TIMER BAR */}
        <div className="timer-bar">
          <span className="timer-icon">⏳</span>
          <span className="timer-text">{countdown || "Loading countdown..."}</span>
          <span className="duration-tag">⏱️ {session.durationMinutes} Minutes</span>
        </div>
      </section>

      {/* PARTICIPANTS CARD */}
      <section className="participants-card glass-card">
        <h2>👥 Session Participants</h2>

        <div className="participants-grid">
          <div className="participant-box teacher-box">
            <div className="role-tag">🎓 Mentor / Teacher</div>
            <div className="user-row">
              <Avatar src={teacher?.avatar} name={teacher?.name} size="lg" />
              <div>
                <h3>{teacher?.name}</h3>
                <p>{teacher?.college || "Skill Mentor"}</p>
                <small>{teacher?.course}</small>
              </div>
            </div>
          </div>

          <div className="participant-box learner-box">
            <div className="role-tag">📚 Learner / Peer</div>
            <div className="user-row">
              <Avatar src={learner?.avatar} name={learner?.name} size="lg" />
              <div>
                <h3>{learner?.name}</h3>
                <p>{learner?.college || "Skill Explorer"}</p>
                <small>{learner?.course}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO CLASSROOM CONTAINER */}
      <section className="classroom-section glass-card">
        <div className="classroom-header">
          <h2>📹 Browser Video Class Room</h2>
          <div className="classroom-actions">
            {!isJoined ? (
              <button
                className="btn-primary btn-lg"
                onClick={() => setIsJoined(true)}
                disabled={session.status === "cancelled"}
              >
                📹 Join Video Call Now
              </button>
            ) : (
              <button
                className="btn-secondary"
                onClick={() => setIsJoined(false)}
              >
                🚪 Leave Call View
              </button>
            )}

            {session.status === "scheduled" && (
              <button
                className="btn-success"
                onClick={() => handleUpdateStatus("completed")}
                disabled={updatingStatus}
              >
                {updatingStatus ? "Updating..." : "✓ Mark Completed & Review"}
              </button>
            )}

            {session.status === "scheduled" && (
              <button
                className="btn-danger-sm"
                onClick={() => handleUpdateStatus("cancelled")}
                disabled={updatingStatus}
              >
                Cancel Session
              </button>
            )}
          </div>
        </div>

        {isJoined ? (
          <div className="jitsi-container">
            <iframe
              src={jitsiUrl}
              title="SkillSphere Peer Video Call"
              allow="camera; microphone; display-capture; autoplay; clipboard-write; fullscreen"
              className="jitsi-iframe"
            />
          </div>
        ) : (
          <div className="video-placeholder">
            <span className="placeholder-icon">📹</span>
            <h3>Ready to start your peer learning call?</h3>
            <p>
              No installation needed! Click "Join Video Call Now" to open your HD audio/video room in your browser.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default SessionDetail;
