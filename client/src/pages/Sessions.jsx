import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import "./Sessions.css";

function Sessions() {
  const { currentUser } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'scheduled', 'completed'
  const [message, setMessage] = useState("");

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sessions");
      if (res.data && res.data.success) {
        setSessions(res.data.sessions || []);
      }
    } catch (err) {
      console.error("Error loading sessions:", err);
      setMessage("Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      setMessage("");
      const res = await api.put(`/sessions/${id}`, { status });
      if (res.data && res.data.success) {
        setMessage(`Session status updated to "${status}"`);
        setSessions((prev) => prev.map((s) => (s._id === id ? { ...s, status } : s)));
      }
    } catch (err) {
      console.error("Error updating session status:", err);
      setMessage(err.response?.data?.message || "Failed to update session.");
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (filter === "scheduled") return s.status === "scheduled";
    if (filter === "completed") return s.status === "completed";
    return true;
  });

  if (loading) {
    return (
      <div className="sessions-loading glass-card">
        <div className="loader"></div>
        <h2>Loading Learning Sessions...</h2>
      </div>
    );
  }

  return (
    <div className="sessions-container">
      {/* HERO BANNER */}
      <section className="sessions-hero glass-card">
        <div>
          <span className="badge-accent">📅 Live Peer Workshops</span>
          <h1>
            Scheduled <span className="highlight-name">Skill Sessions</span>
          </h1>
          <p>
            Join 1-on-1 video calls via HD web meetings, share screens, and practice coding together.
          </p>
        </div>

        <div className="filter-buttons">
          <button
            className={`btn-secondary ${filter === "all" ? "active-filter" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({sessions.length})
          </button>
          <button
            className={`btn-secondary ${filter === "scheduled" ? "active-filter" : ""}`}
            onClick={() => setFilter("scheduled")}
          >
            Scheduled
          </button>
          <button
            className={`btn-secondary ${filter === "completed" ? "active-filter" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
      </section>

      {message && <div className="sessions-alert">{message}</div>}

      {/* SESSIONS GRID */}
      <div className="sessions-grid">
        {filteredSessions.length === 0 ? (
          <div className="empty-state glass-card" style={{ gridColumn: "1/-1" }}>
            <span className="empty-icon">📹</span>
            <h3>No learning sessions found</h3>
            <p>Open a conversation in Live Chat to schedule a 1-on-1 video call!</p>
          </div>
        ) : (
          filteredSessions.map((s) => {
            const isHost = s.host?._id === currentUser._id;
            const peer = isHost ? s.participant : s.host;
            return (
              <div key={s._id} className="session-card glass-card">
                <div className="session-top">
                  <span className={`status-tag status-${s.status}`}>{s.status}</span>
                  <span className="duration-tag">⏱️ {s.durationMinutes} Mins</span>
                </div>

                <h3>{s.topic}</h3>

                <div className="peer-details">
                  <div className="avatar-small">
                    {peer?.name ? peer.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <strong>Partner: {peer?.name || "Peer Learner"}</strong>
                    <p>{peer?.college || "Skill Partner"}</p>
                  </div>
                </div>

                <div className="date-box">
                  <span>🗓️ Scheduled Date & Time:</span>
                  <strong>{new Date(s.scheduledDate).toLocaleString()}</strong>
                </div>

                <div className="session-actions">
                  <Link to={`/session/${s._id}`} className="btn-primary flex-1">
                    📹 Enter Video Room
                  </Link>

                  {s.status === "scheduled" && (
                    <button
                      onClick={() => handleUpdateStatus(s._id, "completed")}
                      className="btn-secondary"
                    >
                      Mark Completed ✓
                    </button>
                  )}

                  {s.status === "completed" && (
                    <span className="completed-badge">✓ Session Finished</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Sessions;