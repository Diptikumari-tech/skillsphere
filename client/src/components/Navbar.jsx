import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";
import api from "../services/api";
import Avatar from "./Avatar";

import "./Navbar.css";

function Navbar() {
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const loadUnreadNotifications = async () => {
      if (!currentUser) return;
      try {
        const res = await api.get("/notifications");
        if (res.data && res.data.success) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };

    loadUnreadNotifications();
  }, [currentUser, location.pathname]);

  if (!currentUser) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-container">
      <nav className="navbar glass-nav">
        <Link to="/dashboard" className="logo-brand">
          <div className="logo-icon">🔮</div>
          <span className="logo-text">SkillSphere</span>
          <span className="logo-badge">MERN</span>
        </Link>

        <div className="nav-menu">
          <Link to="/dashboard" className={`nav-item ${isActive("/dashboard") ? "active" : ""}`}>
            📊 Dashboard
          </Link>
          <Link to="/matches" className={`nav-item ${isActive("/matches") ? "active" : ""}`}>
            🎯 Matches
          </Link>
          <Link to="/skills" className={`nav-item ${isActive("/skills") ? "active" : ""}`}>
            🧠 Skills
          </Link>
          <Link to="/requests" className={`nav-item ${isActive("/requests") ? "active" : ""}`}>
            📨 Swap Requests
          </Link>
          <Link to="/connections" className={`nav-item ${isActive("/connections") ? "active" : ""}`}>
            🤝 Connections
          </Link>
          <Link to="/sessions" className={`nav-item ${isActive("/sessions") ? "active" : ""}`}>
            📅 Sessions
          </Link>
          <Link to="/reviews" className={`nav-item ${isActive("/reviews") ? "active" : ""}`}>
            ⭐ Reviews
          </Link>

          <Link to="/notifications" className={`nav-item nav-notif ${isActive("/notifications") ? "active" : ""}`}>
            🔔
            {unreadCount > 0 && (
              <span className="notif-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Dark/Light Mode">
            {darkMode ? "☀️" : "🌙"}
          </button>

          <div className="user-profile-menu">
            <Link to="/profile" className="profile-pill">
              <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
              <span className="user-name-short">{currentUser.name?.split(" ")[0]}</span>
            </Link>

            <button className="logout-icon-btn" onClick={handleLogout} title="Logout">
              🚪
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;