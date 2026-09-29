import React from "react";
import "./Avatar.css";

function Avatar({ src, name, size = "md", isOnline = false, showStatus = false, onClick }) {
  const getInitial = () => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const sizeClass = `avatar-${size}`;

  return (
    <div className={`avatar-container ${sizeClass}`} onClick={onClick}>
      {src ? (
        <img src={src} alt={name || "User Avatar"} className="avatar-img" />
      ) : (
        <div className="avatar-initials">{getInitial()}</div>
      )}
      {showStatus && (
        <span className={`status-indicator ${isOnline ? "online" : "offline"}`} />
      )}
    </div>
  );
}

export default Avatar;
