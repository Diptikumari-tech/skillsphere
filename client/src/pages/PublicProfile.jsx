import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Avatar from "../components/Avatar";

function PublicProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/${userId}`);
        if (res.data && res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
        <div className="loader" style={{ margin: "0 auto 1rem" }}></div>
        <h2>Loading Student Portfolio...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
        <h3>User not found</h3>
        <button className="btn-secondary" onClick={() => navigate("/matches")}>
          ← Back to Matches
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* USER HERO COVER CARD */}
      <div className="glass-card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Avatar src={user.avatar} name={user.name} size="huge" />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "0.2rem" }}>{user.name}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              🎓 {user.college || "University Student"}{" "}
              {user.course ? `• ${user.course}` : ""}{" "}
              {user.year ? `(${user.year})` : ""}
            </p>
            {user.location && (
              <span style={{ fontSize: "0.85rem", color: "var(--text-light)", display: "block", marginTop: "0.2rem" }}>
                📍 {user.location}
              </span>
            )}
          </div>

          <div style={{ textAlign: "center", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "0.5rem 1rem", borderRadius: "14px" }}>
            <span style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--warning)", display: "block" }}>
              ⭐ {user.rating?.average || "5.0"}
            </span>
            <span style={{ fontSize: "0.65rem", textTransform: "uppercase", fontWeight: "700", color: "var(--text-muted)" }}>
              Peer Rating
            </span>
          </div>
        </div>

        {user.bio && (
          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.15)", borderRadius: "12px", fontStyle: "italic" }}>
            "{user.bio}"
          </div>
        )}
      </div>

      {/* SKILLS SPLIT */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* SKILLS OFFERED */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>🎓 Skills Offered (Teaching)</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {user.teachSkills?.length > 0 ? (
              user.teachSkills.map((s, idx) => (
                <span key={idx} className="skill-pill pill-teach">
                  {s.name || s} ({s.level || "Intermediate"})
                </span>
              ))
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>General Skills</span>
            )}
          </div>
        </div>

        {/* SKILLS WANTED */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>📚 Skills Wanted (Learning)</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {user.learnSkills?.length > 0 ? (
              user.learnSkills.map((s, idx) => (
                <span key={idx} className="skill-pill pill-learn">
                  {s.name || s} ({s.level || "Beginner"})
                </span>
              ))
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>General Learning</span>
            )}
          </div>
        </div>
      </div>

      {/* SOCIAL LINKS CARD */}
      {(user.socialLinks?.github || user.socialLinks?.linkedin || user.socialLinks?.portfolio) && (
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>🌐 Portfolio & Social Media</h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {user.socialLinks?.github && (
              <a href={user.socialLinks.github} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                💻 GitHub Profile
              </a>
            )}
            {user.socialLinks?.linkedin && (
              <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                👔 LinkedIn Profile
              </a>
            )}
            {user.socialLinks?.portfolio && (
              <a href={user.socialLinks.portfolio} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                🌐 Portfolio Website
              </a>
            )}
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
        <button className="btn-secondary" onClick={() => navigate("/matches")}>
          ← Back to Matches
        </button>
      </div>
    </div>
  );
}

export default PublicProfile;
