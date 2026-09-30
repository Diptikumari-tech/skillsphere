import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import "./Dashboard.css";

function Dashboard() {
  const { currentUser } = useAuth();

  const [stats, setStats] = useState({
    connections: 0,
    matches: 0,
    sessions: 0,
    completedSessions: 0,
    notifications: 0,
    skillsOffered: 0,
    skillsWanted: 0,
    exchangesCount: 0,
    rating: 0,
  });

  const [matchesList, setMatchesList] = useState([]);
  const [userSkillsList, setUserSkillsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar State
  const currentDate = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        // 1. Fetch Algorithmic Matches
        const matchesRes = await api.get("/matches").catch(() => ({ data: { matches: [] } }));
        const matchesData = matchesRes.data?.matches || [];
        setMatchesList(matchesData.slice(0, 4));

        // 2. Fetch User Requests / Exchanges
        const reqRes = await api.get("/requests").catch(() => ({ data: { incoming: [], outgoing: [] } }));
        const incoming = reqRes.data?.incoming || [];
        const outgoing = reqRes.data?.outgoing || [];
        const totalExchanges = incoming.length + outgoing.length;

        // 3. User Skills
        const teach = currentUser.teachSkills || [];
        const learn = currentUser.learnSkills || [];
        
        // Build user skills list for table
        const combinedSkills = [
          ...teach.map((s) => ({ name: s.name || s, type: "Offer", status: "Active" })),
          ...learn.map((s) => ({ name: s.name || s, type: "Want", status: "Active" })),
        ];
        setUserSkillsList(combinedSkills);

        setStats({
          connections: incoming.filter((r) => r.status === "accepted").length + outgoing.filter((r) => r.status === "accepted").length,
          matches: matchesData.length,
          sessions: 3,
          completedSessions: 1,
          notifications: 0,
          skillsOffered: teach.length || 3,
          skillsWanted: learn.length || 2,
          exchangesCount: totalExchanges || 12,
          rating: currentUser.rating?.average || 5.0,
        });
      } catch (error) {
        console.error("Dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  // Calendar generator helper
  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Blank days before 1st of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
    }
    // Days of month
    const activeSessionDays = [4, 5, 10, 11, 12, 14, 18, 19];
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = d === currentDate.getDate();
      const hasSession = activeSessionDays.includes(d);
      days.push(
        <div
          key={d}
          className={`cal-day ${isToday ? "today" : ""} ${hasSession ? "has-session" : ""}`}
        >
          {d}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="dashboard-wrapper">
      {/* 1. TOP WELCOME BANNER */}
      <section className="welcome-banner">
        <div className="welcome-content">
          <h1>Welcome back, {currentUser?.name?.split(" ")[0] || "Student"}! 👋</h1>
          <p>Continue your learning journey with peer-to-peer skill sharing & live video exchanges.</p>
        </div>
        <div className="welcome-actions">
          <Link to="/skills" className="btn-banner-primary">
            + Post Skill
          </Link>
          <Link to="/matches" className="btn-banner-secondary">
            Explore Skills
          </Link>
        </div>
      </section>

      {/* 2. STATS METRICS ROW */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-left">
            <span className="metric-value">{stats.skillsOffered}</span>
            <span className="metric-title">Active Skills</span>
            <span className="metric-sub text-green">+1 this month</span>
          </div>
          <div className="metric-icon icon-blue">🔄</div>
        </div>

        <div className="metric-card">
          <div className="metric-left">
            <span className="metric-value">{stats.exchangesCount}</span>
            <span className="metric-title">Total Exchanges</span>
            <span className="metric-sub text-green">+3 this month</span>
          </div>
          <div className="metric-icon icon-purple">👥</div>
        </div>

        <div className="metric-card">
          <div className="metric-left">
            <span className="metric-value">{stats.skillsOffered + stats.skillsWanted}</span>
            <span className="metric-title">Offered Skills</span>
            <span className="metric-sub text-green">+5 this month</span>
          </div>
          <div className="metric-icon icon-emerald">🎯</div>
        </div>

        <div className="metric-card">
          <div className="metric-left">
            <span className="metric-value">⭐ {stats.rating}</span>
            <span className="metric-title">Peer Rating</span>
            <span className="metric-sub text-blue">Top Rated Peer</span>
          </div>
          <div className="metric-icon icon-amber">🌟</div>
        </div>
      </section>

      {/* 3. MAIN DASHBOARD CONTENT GRID */}
      <div className="dashboard-main-grid">
        {/* LEFT COLUMN: Skills Table & Recent Matches */}
        <div className="left-dashboard-panel">
          {/* USER SKILLS LIST TABLE */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>My Posted Skills</h2>
              <Link to="/skills" className="card-link">Manage →</Link>
            </div>

            <div className="skills-table-container">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userSkillsList.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="empty-td">No skills added yet. Click "+ Post Skill" to add one!</td>
                    </tr>
                  ) : (
                    userSkillsList.slice(0, 5).map((item, idx) => (
                      <tr key={idx}>
                        <td className="font-semibold">{item.name}</td>
                        <td>
                          <span className={`type-badge ${item.type === "Offer" ? "type-offer" : "type-want"}`}>
                            {item.type}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge-active">Active</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ALGORITHMIC MATCHES LIST */}
          <div className="dash-card">
            <div className="dash-card-header">
              <h2>Top Peer Matches</h2>
              <Link to="/matches" className="card-link">View All →</Link>
            </div>

            <div className="matches-list">
              {matchesList.length === 0 ? (
                <div className="empty-matches-box">
                  <p>No matches yet. Add skills to get algorithmic pairings!</p>
                </div>
              ) : (
                matchesList.map((m) => (
                  <div key={m.user._id} className="match-row-item">
                    <Avatar src={m.user.avatar} name={m.user.name} size="md" />
                    <div className="match-row-info">
                      <h4>{m.user.name}</h4>
                      <p>
                        Teaches: <span>{m.user.teachSkills?.[0]?.name || "Web Development"}</span>
                      </p>
                      <small>Interested in graphic design & writing</small>
                    </div>
                    <Link to={`/user/${m.user._id}`} className="btn-view-match">
                      View
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Actions & Calendar Widget */}
        <div className="right-dashboard-panel">
          {/* QUICK ACTION CARDS */}
          <div className="quick-actions-card">
            <Link to="/skills" className="action-tile">
              <div className="tile-icon">👤+</div>
              <div>
                <h4>Offer a Skill</h4>
                <p>Post the skill you can trade with others</p>
              </div>
            </Link>

            <Link to="/matches" className="action-tile">
              <div className="tile-icon">🎯</div>
              <div>
                <h4>Find a Match</h4>
                <p>Discover Users to exchange skills with</p>
              </div>
            </Link>
          </div>

          {/* CALENDAR WIDGET */}
          <div className="calendar-card">
            <div className="calendar-header">
              <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            </div>

            <div className="calendar-weekdays">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            <div className="calendar-days-grid">
              {renderCalendarDays()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;