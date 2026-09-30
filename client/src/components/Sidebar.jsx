import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";
import "./Sidebar.css";

function Sidebar({ activeTab, onTabSelect }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!currentUser) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="app-sidebar glass-sidebar">
      <div className="sidebar-brand">
        <Link to="/dashboard" className="brand-logo">
          <span className="brand-icon">🔮</span>
          <span className="brand-name">SkillSphere</span>
        </Link>
      </div>

      <div className="sidebar-user-card">
        <Avatar src={currentUser.avatar} name={currentUser.name} size="md" />
        <div className="user-info">
          <h4>{currentUser.name}</h4>
          <span className="user-role">🎓 {currentUser.college || "Skill Explorer"}</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="menu-group">
          <span className="menu-label">Main Menu</span>
          
          <Link to="/dashboard" className={`sidebar-item ${isActive("/dashboard") ? "active" : ""}`}>
            <span className="item-icon">📊</span>
            <span>Dashboard</span>
          </Link>

          <Link to="/matches" className={`sidebar-item ${isActive("/matches") ? "active" : ""}`}>
            <span className="item-icon">🎯</span>
            <span>AI Matches</span>
          </Link>

          <Link to="/chat/active" className={`sidebar-item ${isActive("/chat/active") || location.pathname.startsWith("/chat") ? "active" : ""}`}>
            <span className="item-icon">💬</span>
            <span>Messages</span>
          </Link>

          <Link to="/skills" className={`sidebar-item ${isActive("/skills") ? "active" : ""}`}>
            <span className="item-icon">🧠</span>
            <span>My Skills</span>
          </Link>

          <Link to="/connections" className={`sidebar-item ${isActive("/connections") ? "active" : ""}`}>
            <span className="item-icon">🤝</span>
            <span>Connections</span>
          </Link>

          <Link to="/sessions" className={`sidebar-item ${isActive("/sessions") ? "active" : ""}`}>
            <span className="item-icon">🏫</span>
            <span>Skill Rooms</span>
          </Link>
        </div>

        <div className="menu-group">
          <span className="menu-label">Account & Support</span>

          <Link to="/profile" className={`sidebar-item ${isActive("/profile") ? "active" : ""}`}>
            <span className="item-icon">⚙️</span>
            <span>Settings</span>
          </Link>

          <Link to="/requests" className={`sidebar-item ${isActive("/requests") ? "active" : ""}`}>
            <span className="item-icon">📨</span>
            <span>Swap Requests</span>
          </Link>

          <Link to="/reviews" className={`sidebar-item ${isActive("/reviews") ? "active" : ""}`}>
            <span className="item-icon">⭐</span>
            <span>Reviews</span>
          </Link>
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout-btn" onClick={handleLogout} title="Sign Out">
          <span className="logout-icon">🚪</span>
          <span className="logout-text">LOGOUT</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
