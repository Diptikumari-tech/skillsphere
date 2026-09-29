import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import "./Matches.css";

function Matches() {
  const { currentUser } = useAuth();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [matchFilter, setMatchFilter] = useState("all"); // 'all', 'high', 'medium'
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State for sending Swap Request
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [offeredSkill, setOfferedSkill] = useState("");
  const [wantedSkill, setWantedSkill] = useState("");
  const [note, setNote] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [message, setMessage] = useState("");

  const loadMatches = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/matches");
      if (response.data && response.data.success) {
        setMatches(response.data.matches || []);
      }
    } catch (error) {
      console.error("Error loading matches:", error);
      setMessage("Failed to load skill matches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const openSwapModal = (matchItem) => {
    const candidate = matchItem.user;
    setSelectedCandidate(candidate);
    
    // Set default offered & wanted skills
    const defaultOffered = currentUser?.teachSkills?.[0]?.name || "General Teaching";
    const defaultWanted = candidate.teachSkills?.[0]?.name || "General Learning";
    
    setOfferedSkill(defaultOffered);
    setWantedSkill(defaultWanted);
    setNote(`Hi ${candidate.name}, I would love to trade ${defaultOffered} for your ${defaultWanted} skill!`);
  };

  const closeSwapModal = () => {
    setSelectedCandidate(null);
    setOfferedSkill("");
    setWantedSkill("");
    setNote("");
  };

  const handleSendSwapRequest = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    try {
      setSendingRequest(true);
      setMessage("");

      const response = await api.post("/requests", {
        receiverId: selectedCandidate._id,
        offeredSkill,
        wantedSkill,
        note,
      });

      if (response.data && response.data.success) {
        setMessage(`✨ Swap request successfully sent to ${selectedCandidate.name}!`);
        closeSwapModal();
      }
    } catch (error) {
      console.error("Error sending swap request:", error);
      setMessage(error.response?.data?.message || "Failed to send swap request.");
    } finally {
      setSendingRequest(false);
    }
  };

  const filteredMatches = useMemo(() => {
    return matches.filter((item) => {
      const u = item.user;
      const name = (u.name || "").toLowerCase();
      const college = (u.college || "").toLowerCase();
      const q = search.toLowerCase();

      const matchesSearch = name.includes(q) || college.includes(q);
      if (!matchesSearch) return false;

      if (matchFilter === "high") return item.matchScore >= 70;
      if (matchFilter === "medium") return item.matchScore >= 40 && item.matchScore < 70;

      return true;
    });
  }, [matches, search, matchFilter]);

  if (loading) {
    return (
      <div className="matches-loading glass-card">
        <div className="loader"></div>
        <h2>Calculating Algorithmic Matches...</h2>
        <p>Analyzing skill sets and learning preferences across the community.</p>
      </div>
    );
  }

  return (
    <div className="matches-container">
      {/* HERO HEADER */}
      <section className="matches-hero glass-card">
        <div>
          <span className="badge-accent">🤖 AI Recommendations</span>
          <h1>
            Discover Your Ideal <span className="highlight-name">Skill Partners</span>
          </h1>
          <p>
            Our recommendation engine pairs your learning goals with peer skill offers.
          </p>
        </div>

        <button className="btn-secondary" onClick={loadMatches}>
          ↻ Refresh Recommendations
        </button>
      </section>

      {message && <div className="matches-alert">{message}</div>}

      {/* FILTER TOOLBAR */}
      <div className="toolbar-card glass-card">
        <div className="search-input-wrapper">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search partners by name, college, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Match Level:</label>
          <select value={matchFilter} onChange={(e) => setMatchFilter(e.target.value)}>
            <option value="all">All Matches ({matches.length})</option>
            <option value="high">🔥 High Compatibility (70%+)</option>
            <option value="medium">⚡ Medium Match (40%-70%)</option>
          </select>
        </div>
      </div>

      {/* MATCHES CARDS GRID */}
      <div className="matches-grid">
        {filteredMatches.length === 0 ? (
          <div className="empty-state glass-card" style={{ gridColumn: "1/-1" }}>
            <span className="empty-icon">🎯</span>
            <h3>No matches fit your criteria</h3>
            <p>Try clearing filters or adding more teaching & learning skills to your profile.</p>
            <Link to="/profile" className="btn-primary">
              Update Profile Skills
            </Link>
          </div>
        ) : (
          filteredMatches.map((item) => {
            const candidate = item.user;
            return (
              <div key={candidate._id} className="match-user-card glass-card">
                {/* CARD HEADER */}
                <div className="card-top">
                  <div className="user-avatar-wrapper">
                    <Avatar src={candidate.avatar} name={candidate.name} size="lg" />
                    {item.isMutualMatch && (
                      <span className="mutual-badge" title="Mutual Skill Swap Opportunity">
                        🤝 Mutual
                      </span>
                    )}
                  </div>

                  <div className="score-badge-circle" title="Match Percentage">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path
                        className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="circle"
                        strokeDasharray={`${item.matchScore}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="20.35" className="percentage">
                        {item.matchScore}%
                      </text>
                    </svg>
                  </div>
                </div>

                {/* USER IDENTITY */}
                <div className="user-identity">
                  <h3>{candidate.name}</h3>
                  <p className="college-course">
                    🎓 {candidate.college || "University Student"}{" "}
                    {candidate.course ? `• ${candidate.course}` : ""}
                  </p>
                  {candidate.bio && <p className="user-bio">"{candidate.bio}"</p>}
                </div>

                {/* SKILLS OFFERED */}
                <div className="skills-block">
                  <span className="block-title title-teach">Teaches:</span>
                  <div className="pills-wrap">
                    {candidate.teachSkills?.length > 0 ? (
                      candidate.teachSkills.map((s, idx) => (
                        <span key={idx} className="skill-pill pill-teach">
                          {s.name || s}
                        </span>
                      ))
                    ) : (
                      <span className="none-text">General Tech</span>
                    )}
                  </div>
                </div>

                {/* SKILLS WANTED */}
                <div className="skills-block">
                  <span className="block-title title-learn">Wants to Learn:</span>
                  <div className="pills-wrap">
                    {candidate.learnSkills?.length > 0 ? (
                      candidate.learnSkills.map((s, idx) => (
                        <span key={idx} className="skill-pill pill-learn">
                          {s.name || s}
                        </span>
                      ))
                    ) : (
                      <span className="none-text">General Learning</span>
                    )}
                  </div>
                </div>

                {/* CARD ACTIONS */}
                <div className="card-actions">
                  <button onClick={() => openSwapModal(item)} className="btn-primary flex-1">
                    Swap Skills 🤝
                  </button>
                  <Link to={`/user/${candidate._id}`} className="btn-secondary">
                    Profile
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SWAP REQUEST MODAL DIALOG */}
      {selectedCandidate && (
        <div className="modal-overlay" onClick={closeSwapModal}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Propose Skill Swap 🤝</h2>
              <button className="close-btn" onClick={closeSwapModal}>
                ×
              </button>
            </div>

            <p className="modal-subtitle">
              Send an invitation to <strong>{selectedCandidate.name}</strong> to initiate a peer learning partnership.
            </p>

            <form onSubmit={handleSendSwapRequest} className="swap-modal-form">
              <div className="form-group">
                <label>Skill You Will Teach:</label>
                <select
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  required
                >
                  {currentUser?.teachSkills?.map((s, idx) => (
                    <option key={idx} value={s.name || s}>
                      {s.name || s}
                    </option>
                  ))}
                  <option value="General Coding Guidance">General Coding Guidance</option>
                </select>
              </div>

              <div className="form-group">
                <label>Skill You Want {selectedCandidate.name} to Teach:</label>
                <select
                  value={wantedSkill}
                  onChange={(e) => setWantedSkill(e.target.value)}
                  required
                >
                  {selectedCandidate.teachSkills?.map((s, idx) => (
                    <option key={idx} value={s.name || s}>
                      {s.name || s}
                    </option>
                  ))}
                  <option value="General Skill Exchange">General Skill Exchange</option>
                </select>
              </div>

              <div className="form-group">
                <label>Personal Invitation Note:</label>
                <textarea
                  rows="3"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Introduce yourself and explain your learning availability..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeSwapModal}>
                  Cancel
                </button>
                <button type="submit" disabled={sendingRequest} className="btn-primary">
                  {sendingRequest ? "Sending..." : "Send Proposal 🚀"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Matches;
