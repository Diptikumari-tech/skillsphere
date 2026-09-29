import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      if (res.data && res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put("/notifications/all/read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "requests") return n.type === "request" || n.type === "accepted";
    if (filter === "chat") return n.type === "chat";
    return true;
  });

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
        <div className="loader" style={{ margin: "0 auto 1rem" }}></div>
        <h2>Loading Notifications...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <section className="glass-card" style={{ padding: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span className="badge-accent">🔔 Real-Time Alerts</span>
          <h1 style={{ marginTop: "0.25rem" }}>System & Activity Notifications</h1>
          <p>Stay updated on skill swap requests, new messages, and scheduled video sessions.</p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button className="btn-secondary" onClick={markAllRead}>
            Mark All as Read ✓
          </button>
        )}
      </section>

      {/* FILTER TABS */}
      <div className="glass-card" style={{ padding: "0.75rem 1.25rem", display: "flex", gap: "0.5rem" }}>
        <button
          className={`btn-secondary btn-sm ${filter === "all" ? "active-filter" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({notifications.length})
        </button>
        <button
          className={`btn-secondary btn-sm ${filter === "unread" ? "active-filter" : ""}`}
          onClick={() => setFilter("unread")}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
        <button
          className={`btn-secondary btn-sm ${filter === "requests" ? "active-filter" : ""}`}
          onClick={() => setFilter("requests")}
        >
          Swap Requests
        </button>
        <button
          className={`btn-secondary btn-sm ${filter === "chat" ? "active-filter" : ""}`}
          onClick={() => setFilter("chat")}
        >
          Messages
        </button>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {filteredNotifications.length === 0 ? (
          <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.5rem" }}>🔔</span>
            <h3>No notifications here</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n._id}
              className="glass-card"
              style={{
                padding: "1.1rem 1.4rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: n.read ? "var(--glass-bg)" : "rgba(99, 102, 241, 0.12)",
                borderColor: n.read ? "var(--card-border)" : "rgba(99, 102, 241, 0.3)",
              }}
            >
              <div>
                <h4 style={{ fontSize: "1rem", marginBottom: "0.2rem" }}>{n.title}</h4>
                <p style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>{n.message}</p>
                <small style={{ color: "var(--text-light)", fontSize: "0.75rem" }}>
                  🗓️ {new Date(n.createdAt || Date.now()).toLocaleString()}
                </small>
              </div>

              {n.link && (
                <Link to={n.link} className="btn-primary btn-sm">
                  View →
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;