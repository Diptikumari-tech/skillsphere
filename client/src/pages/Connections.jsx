import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Avatar from "../components/Avatar";

function Connections() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        const res = await api.get("/connections");
        if (res.data && res.data.success) {
          setConnections(res.data.connections || []);
        }
      } catch (err) {
        console.error("Error loading connections:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, []);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: "3rem", textAlign: "center", maxWidth: "900px", margin: "0 auto" }}>
        <div className="loader" style={{ margin: "0 auto 1rem" }}></div>
        <h2>Loading Active Skill Connections...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* HERO BANNER */}
      <section className="glass-card" style={{ padding: "2rem" }}>
        <span className="badge-accent">🤝 Collaborative Network</span>
        <h1 style={{ marginTop: "0.25rem" }}>My Active Skill Connections</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Peer partners with whom you have established mutual skill exchange agreements.
        </p>
      </section>

      {connections.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>🤝</span>
          <h3>No active skill connections yet.</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Send a skill swap request from the Matches page to start connecting!
          </p>
          <Link to="/matches" className="btn-primary">
            Find Matches 🎯
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "1.25rem" }}>
          {connections.map((conn) => {
            const partner = conn.user;
            return (
              <div key={conn.connectionId} className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <Avatar src={partner.avatar} name={partner.name} size="lg" />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>{partner.name}</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      🎓 {partner.college || "University Student"}
                    </p>
                    {partner.rating?.average > 0 && (
                      <span style={{ fontSize: "0.8rem", color: "var(--warning)", fontWeight: "bold" }}>
                        ⭐ {partner.rating.average} Rating
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ padding: "0.75rem", background: "rgba(99, 102, 241, 0.08)", borderRadius: "10px", fontSize: "0.85rem" }}>
                  <div><strong>Teaching You:</strong> {conn.offeredSkill}</div>
                  <div style={{ marginTop: "0.25rem" }}><strong>Learning From You:</strong> {conn.wantedSkill}</div>
                </div>

                {conn.lastMessage?.text && (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-light)", fontStyle: "italic", margin: 0 }}>
                    "{conn.lastMessage.text.length > 60 ? `${conn.lastMessage.text.substring(0, 60)}...` : conn.lastMessage.text}"
                  </p>
                )}

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto", paddingTop: "0.5rem" }}>
                  {conn.chatId ? (
                    <Link to={`/chat/${conn.chatId}`} className="btn-primary" style={{ flex: 1, textAlign: "center" }}>
                      Chat 💬
                    </Link>
                  ) : (
                    <Link to="/chat/active" className="btn-primary" style={{ flex: 1, textAlign: "center" }}>
                      Chat 💬
                    </Link>
                  )}
                  <Link to={`/user/${partner._id}`} className="btn-secondary">
                    Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Connections;