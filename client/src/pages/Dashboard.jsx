import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function Dashboard() {
  const { currentUser } = useAuth();

  const [stats, setStats] = useState({
    connections: 0,
    matches: 0,
    sessions: 0,
    completedSessions: 0,
    notifications: 0,
    skills: 0,
    rating: 0,
    profileCompletion: 0,
  });

  const [recentRequests, setRecentRequests] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) {
        setLoadingStats(false);
        return;
      }

      try {
        setLoadingStats(true);

        // Fetch matches count
        const matchesRes = await api.get("/matches").catch(() => ({ data: { matches: [] } }));
        const matchesCount = matchesRes.data?.matches?.length || 0;

        // Fetch requests for connections & recent activity
        const reqRes = await api.get("/requests").catch(() => ({ data: { incoming: [], outgoing: [] } }));
        const incomingReqs = reqRes.data?.incoming || [];
        const outgoingReqs = reqRes.data?.outgoing || [];

        const acceptedIncoming = incomingReqs.filter((r) => r.status === "accepted").length;
        const acceptedOutgoing = outgoingReqs.filter((r) => r.status === "accepted").length;
        const totalConnections = acceptedIncoming + acceptedOutgoing;

        setRecentRequests(incomingReqs.slice(0, 3));

        // Fetch sessions count & upcoming sessions
        const sessRes = await api.get("/sessions").catch(() => ({ data: { sessions: [] } }));
        const allSessions = sessRes.data?.sessions || [];
        const totalSessions = allSessions.length;
        const completedSessions = allSessions.filter((s) => s.status === "completed").length;
        const upcoming = allSessions.filter((s) => s.status === "scheduled");

        setUpcomingSessions(upcoming.slice(0, 3));

        // Fetch unread notifications
        const notifRes = await api.get("/notifications").catch(() => ({ data: { unreadCount: 0 } }));
        const unreadCount = notifRes.data?.unreadCount || 0;

        // Skills count
        const teachSkills = currentUser.teachSkills || [];
        const learnSkills = currentUser.learnSkills || [];
        const totalSkills = teachSkills.length + learnSkills.length;

        // Rating
        const rating = currentUser.rating?.average || 0;

        // Profile completion percentage calculation
        const profileFields = [
          currentUser.name,
          currentUser.email,
          currentUser.bio,
          currentUser.college,
          currentUser.course,
          currentUser.year,
          teachSkills.length > 0,
          learnSkills.length > 0,
        ];
        const completedFields = profileFields.filter(Boolean).length;
        const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

        setStats({
          connections: totalConnections,
          matches: matchesCount,
          sessions: totalSessions,
          completedSessions: completedSessions,
          notifications: unreadCount,
          skills: totalSkills,
          rating,
          profileCompletion,
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  return (
    <div className="dashboard-container">
      {/* HERO BANNER */}
      <section className="dashboard-hero glass-card">
        <div className="hero-text">
          <span className="welcome-tag">👋 Welcome Back</span>
          <h1>
            Hello, <span className="highlight-name">{currentUser?.name || "Skill Explorer"}</span>
          </h1>
          <p>
            Swap skills with peers across colleges, schedule video calls, and build your collaborative learning portfolio.
          </p>

          <div className="hero-actions">
            <Link to="/matches" className="btn-primary">
              🎯 Find Matches Now
            </Link>
            <Link to="/skills" className="btn-secondary">
              🧠 Manage My Skills
            </Link>
          </div>
        </div>

        <div className="hero-progress-ring">
          <div className="ring-content">
            <span className="ring-percentage">{stats.profileCompletion}%</span>
            <span className="ring-label">Profile Done</span>
          </div>
        </div>
      </section>

      {/* STATS GRID */}
      <section className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper icon-indigo">🤝</div>
          <div className="stat-info">
            <h3>{loadingStats ? "..." : stats.connections}</h3>
            <p>Active Connections</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper icon-violet">🎯</div>
          <div className="stat-info">
            <h3>{loadingStats ? "..." : stats.matches}</h3>
            <p>Algorithmic Matches</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper icon-emerald">🧠</div>
          <div className="stat-info">
            <h3>{loadingStats ? "..." : stats.skills}</h3>
            <p>Skills Offered & Wanted</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper icon-amber">📅</div>
          <div className="stat-info">
            <h3>{loadingStats ? "..." : stats.completedSessions}</h3>
            <p>Sessions Completed</p>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon-wrapper icon-rose">⭐</div>
          <div className="stat-info">
            <h3>{loadingStats ? "..." : stats.rating || "New"}</h3>
            <p>Community Rating</p>
          </div>
        </div>
      </section>

      {/* DASHBOARD SPLIT CONTENT */}
      <div className="dashboard-split">
        {/* LEFT COLUMN: Activity Feed & Upcoming Sessions */}
        <div className="left-column">
          {/* UPCOMING SESSIONS */}
          <section className="dashboard-section glass-card">
            <div className="section-header">
              <h2>📅 Upcoming Learning Calls</h2>
              <Link to="/sessions" className="view-all-link">
                View All →
              </Link>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="empty-mini">
                <span>📹</span>
                <p>No scheduled calls coming up today.</p>
                <Link to="/matches" className="btn-secondary btn-sm">
                  Schedule Call with Peer
                </Link>
              </div>
            ) : (
              <div className="mini-list">
                {upcomingSessions.map((s) => (
                  <div key={s._id} className="mini-item">
                    <div>
                      <h4>{s.topic}</h4>
                      <p>
                        With: {s.host?.name === currentUser.name ? s.participant?.name : s.host?.name}
                      </p>
                      <small>🗓️ {new Date(s.scheduledDate).toLocaleString()}</small>
                    </div>
                    {s.meetingLink && (
                      <a
                        href={s.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary btn-sm"
                      >
                        Join Call 📹
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* INCOMING SWAP REQUESTS */}
          <section className="dashboard-section glass-card">
            <div className="section-header">
              <h2>📨 Pending Swap Invitations</h2>
              <Link to="/requests" className="view-all-link">
                View All →
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <div className="empty-mini">
                <span>✉️</span>
                <p>No new swap requests pending.</p>
              </div>
            ) : (
              <div className="mini-list">
                {recentRequests.map((r) => (
                  <div key={r._id} className="mini-item">
                    <div>
                      <h4>{r.sender?.name}</h4>
                      <p>
                        Offers <strong>{r.offeredSkill}</strong> for your <strong>{r.wantedSkill}</strong>
                      </p>
                    </div>
                    <Link to="/requests" className="btn-secondary btn-sm">
                      Review Proposal
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Quick Actions & Skill Analytics */}
        <div className="right-column">
          {/* COMMUNITY TRENDING SKILLS */}
          <section className="dashboard-section glass-card">
            <div className="section-header">
              <h2>🔥 In-Demand Peer Skills</h2>
            </div>

            <div className="trending-tags">
              <span className="trend-badge">React 💻</span>
              <span className="trend-badge">Python 🐍</span>
              <span className="trend-badge">Machine Learning 🤖</span>
              <span className="trend-badge">UI/UX Design 🎨</span>
              <span className="trend-badge">Node.js ⚡</span>
              <span className="trend-badge">Data Analytics 📊</span>
            </div>
          </section>

          {/* QUICK SHORTCUTS GRID */}
          <section className="dashboard-section glass-card">
            <div className="section-header">
              <h2>⚡ Quick Shortcuts</h2>
            </div>

            <div className="shortcuts-grid">
              <Link to="/matches" className="shortcut-card">
                <span>🎯</span>
                <div>
                  <strong>Matches</strong>
                  <small>Algorithmic Pairings</small>
                </div>
              </Link>

              <Link to="/chat/active" className="shortcut-card">
                <span>💬</span>
                <div>
                  <strong>Live Chat</strong>
                  <small>Real-time Messaging</small>
                </div>
              </Link>

              <Link to="/profile" className="shortcut-card">
                <span>👤</span>
                <div>
                  <strong>Profile</strong>
                  <small>Edit Info & Links</small>
                </div>
              </Link>

              <Link to="/notifications" className="shortcut-card">
                <span>🔔</span>
                <div>
                  <strong>Alerts</strong>
                  <small>{stats.notifications} Unread</small>
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;