import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import "./Matches.css";

function Matches() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [matchFilter, setMatchFilter] = useState("all"); // 'all', 'strong', 'good', 'fair'
  const [activeTag, setActiveTag] = useState("best");

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

      const matchesSearch =
        name.includes(q) ||
        college.includes(q) ||
        u.teachSkills?.some((s) => (s.name || s).toLowerCase().includes(q)) ||
        u.learnSkills?.some((s) => (s.name || s).toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (matchFilter === "strong") return item.matchScore >= 80;
      if (matchFilter === "good") return item.matchScore >= 60 && item.matchScore < 80;
      if (matchFilter === "fair") return item.matchScore < 60;

      return true;
    });
  }, [matches, search, matchFilter]);

  if (loading) {
    return (
      <div className="matches-loading-card">
        <div className="spinner"></div>
        <h2>Calculating AI Skill Matches...</h2>
        <p>Analyzing profiles and skill swap compatibility across the network.</p>
      </div>
    );
  }

  return (
    <div className="matches-page-container">
      {/* AI MATCHES HEADER */}
      <section className="matches-header-section">
        <div>
          <h1 className="matches-title">AI-Powered Matches</h1>
          <p className="matches-subtitle">Discover people who complement your skills perfectly</p>
        </div>
      </section>

      {message && <div className="matches-alert-banner">{message}</div>}

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="toolbar-wrapper">
        <div className="compatibility-tabs">
          <button
            className={`tab-btn ${matchFilter === "all" ? "active" : ""}`}
            onClick={() => setMatchFilter("all")}
          >
            All Matches
          </button>
          <button
            className={`tab-btn ${matchFilter === "strong" ? "active" : ""}`}
            onClick={() => setMatchFilter("strong")}
          >
            Strong (80%+)
          </button>
          <button
            className={`tab-btn ${matchFilter === "good" ? "active" : ""}`}
            onClick={() => setMatchFilter("good")}
          >
            Good (60-79%)
          </button>
          <button
            className={`tab-btn ${matchFilter === "fair" ? "active" : ""}`}
            onClick={() => setMatchFilter("fair")}
          >
            Fair (&lt;60%)
          </button>
        </div>

        <div className="search-bar-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search skills, people, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* FEATURED TAG PILLS */}
      <div className="tag-pills-row">
        <button
          className={`tag-pill ${activeTag === "best" ? "active" : ""}`}
          onClick={() => setActiveTag("best")}
        >
          ✨ Best match
        </button>
        <button
          className={`tag-pill ${activeTag === "nearby" ? "active" : ""}`}
          onClick={() => setActiveTag("nearby")}
        >
          📍 Within 5 km
        </button>
        <button
          className={`tag-pill ${activeTag === "coding" ? "active" : ""}`}
          onClick={() => {
            setActiveTag("coding");
            setSearch("Coding");
          }}
        >
          💻 Coding
        </button>
        <button
          className={`tag-pill ${activeTag === "music" ? "active" : ""}`}
          onClick={() => {
            setActiveTag("music");
            setSearch("Guitar");
          }}
        >
          🎸 Guitar
        </button>
        <button
          className="tag-pill reset-pill"
          onClick={() => {
            setActiveTag("best");
            setMatchFilter("all");
            setSearch("");
          }}
        >
          🔄 Reset
        </button>
      </div>

      {/* MATCH CARDS GRID */}
      <div className="matches-cards-grid">
        {filteredMatches.length === 0 ? (
          <div className="no-matches-box">
            <span className="no-matches-icon">🎯</span>
            <h3>No matching skill partners found</h3>
            <p>Try adjusting your search query or add more skills to your profile.</p>
            <Link to="/skills" className="btn-add-skills">
              Add Skills to Profile
            </Link>
          </div>
        ) : (
          filteredMatches.map((item) => {
            const candidate = item.user;
            const topTeachSkill = candidate.teachSkills?.[0]?.name || "Web Development";
            const topLearnSkill = candidate.learnSkills?.[0]?.name || "UI/UX Design";

            return (
              <div key={candidate._id} className="swap-partner-card">
                {/* CARD HEADER */}
                <div className="card-header-row">
                  <div className="partner-avatar-group">
                    <Avatar src={candidate.avatar} name={candidate.name} size="lg" />
                    <span className="verified-badge" title="Verified Skill Partner">
                      ✓
                    </span>
                  </div>

                  <div className="partner-meta">
                    <div className="meta-badge-row">
                      <span className="rating-pill">⭐ {candidate.rating?.average || 4.8}</span>
                      <span className="distance-pill">📍 2 km</span>
                      <span className={`score-badge ${item.matchScore >= 80 ? "score-high" : "score-fair"}`}>
                        {item.matchScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* USER IDENTITY & MATCH SUMMARY */}
                <div className="partner-details">
                  <h3 className="partner-name">{candidate.name}</h3>
                  <span className="match-quality-label">
                    Match Quality: {item.matchScore >= 80 ? "Strong Match 🔥" : "Fair Match ⚡"}
                  </span>
                  
                  <div className="match-recommendation-box">
                    <p>You can learn <strong>{topTeachSkill}</strong> from {candidate.name.split(" ")[0]}</p>
                  </div>
                </div>

                {/* OFFERS SKILL PILLS */}
                <div className="skill-section">
                  <span className="section-label">🏷️ Offers...</span>
                  <div className="tag-cloud">
                    {candidate.teachSkills?.length > 0 ? (
                      candidate.teachSkills.map((s, idx) => (
                        <span key={idx} className="offer-tag">
                          {s.name || s}
                        </span>
                      ))
                    ) : (
                      <span className="offer-tag">Web Development</span>
                    )}
                  </div>
                </div>

                {/* LOOKING FOR SKILL PILLS */}
                <div className="skill-section">
                  <span className="section-label">🔍 Looking for...</span>
                  <div className="tag-cloud">
                    {candidate.learnSkills?.length > 0 ? (
                      candidate.learnSkills.map((s, idx) => (
                        <span key={idx} className="looking-tag">
                          {s.name || s}
                        </span>
                      ))
                    ) : (
                      <span className="looking-tag">UI/UX Design</span>
                    )}
                  </div>
                </div>

                {/* CARD ACTION BUTTONS */}
                <div className="card-actions-row">
                  <button
                    className="btn-chat-swap"
                    onClick={() => navigate(`/chat/${candidate._id}`)}
                  >
                    💬 Chat to Swap
                  </button>
                  <button
                    className="btn-confirm-swap"
                    onClick={() => openSwapModal(item)}
                  >
                    ☑️ Confirm Swap
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SWAP REQUEST MODAL DIALOG */}
      {selectedCandidate && (
        <div className="modal-backdrop" onClick={closeSwapModal}>
          <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>Confirm Skill Swap Proposal 🤝</h2>
              <button className="btn-close-dialog" onClick={closeSwapModal}>
                ×
              </button>
            </div>

            <p className="dialog-sub">
              Send an official skill exchange invitation to <strong>{selectedCandidate.name}</strong>.
            </p>

            <form onSubmit={handleSendSwapRequest} className="dialog-form">
              <div className="dialog-field">
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
                  <option value="General Technical Skill">General Technical Skill</option>
                </select>
              </div>

              <div className="dialog-field">
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

              <div className="dialog-field">
                <label>Personal Invitation Note:</label>
                <textarea
                  rows="3"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Introduce yourself and propose your preferred meeting time..."
                />
              </div>

              <div className="dialog-actions">
                <button type="button" className="btn-dialog-cancel" onClick={closeSwapModal}>
                  Cancel
                </button>
                <button type="submit" disabled={sendingRequest} className="btn-dialog-send">
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
