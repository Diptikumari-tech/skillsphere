import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import "./Profile.css";

function Profile() {
  const { currentUser, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    college: "",
    course: "",
    year: "",
    location: "",
    avatar: "",
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: "",
      portfolio: "",
    },
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name || "",
        bio: currentUser.bio || "",
        college: currentUser.college || "",
        course: currentUser.course || "",
        year: currentUser.year || "",
        location: currentUser.location || "",
        avatar: currentUser.avatar || "",
        socialLinks: {
          github: currentUser.socialLinks?.github || "",
          linkedin: currentUser.socialLinks?.linkedin || "",
          twitter: currentUser.socialLinks?.twitter || "",
          portfolio: currentUser.socialLinks?.portfolio || "",
        },
      });
      setAvatarPreview(currentUser.avatar || "");
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress & resize image to 300x300 canvas for fast loading
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setAvatarPreview(dataUrl);
        setProfile((prev) => ({ ...prev, avatar: dataUrl }));
        setMessage("Image selected! Click 'Save Profile' to apply changes.");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarPreview("");
    setProfile((prev) => ({ ...prev, avatar: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    setMessage("Photo removed. Click 'Save Profile' to update.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");

      const response = await api.put("/users/profile", profile);

      if (response.data && response.data.success) {
        updateUser(response.data.user);
        setMessage("🎉 Profile & picture updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-container">
      {/* COVER BANNER */}
      <section className="profile-cover-card glass-card">
        <div className="profile-cover-bg"></div>
        <div className="profile-cover-content">
          <div className="avatar-upload-wrapper">
            <Avatar src={avatarPreview} name={profile.name} size="huge" />
            <button
              type="button"
              className="change-avatar-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Change Profile Photo"
            >
              📷
            </button>
          </div>

          <div className="profile-hero-info">
            <h1>{profile.name || "My Student Profile"}</h1>
            <p>{currentUser?.email}</p>
            <span className="college-tag">
              🎓 {profile.college || "University Student"}{" "}
              {profile.course ? `• ${profile.course}` : ""}
            </span>

            <div className="photo-action-buttons">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo 📷
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  className="btn-danger-sm"
                  onClick={handleRemovePhoto}
                >
                  Remove Photo ✕
                </button>
              )}
            </div>
          </div>

          <div className="rating-badge-box">
            <span className="rating-val">⭐ {currentUser?.rating?.average || "5.0"}</span>
            <span className="rating-lbl">Peer Trust Rating</span>
          </div>
        </div>
      </section>

      {message && <div className="profile-alert">{message}</div>}

      {/* EDIT PROFILE FORM */}
      <form onSubmit={handleSubmit} className="profile-edit-form">
        {/* SECTION 1: BASIC INFORMATION */}
        <div className="form-card glass-card">
          <h2>👤 Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Location / City</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Patna, Bihar / Remote"
                value={profile.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Personal Bio & Learning Goals</label>
              <textarea
                rows="3"
                name="bio"
                placeholder="Tell other students about your passions and project interests..."
                value={profile.bio}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: ACADEMIC DETAILS */}
        <div className="form-card glass-card">
          <h2>🎓 Education Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>College / University</label>
              <input
                type="text"
                name="college"
                placeholder="Enter college name"
                value={profile.college}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Course / Major</label>
              <input
                type="text"
                name="course"
                placeholder="e.g. BCA / B.Tech Computer Science"
                value={profile.course}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Academic Year</label>
              <select name="year" value={profile.year} onChange={handleChange}>
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: SOCIAL PORTFOLIO LINKS */}
        <div className="form-card glass-card">
          <h2>🌐 Portfolio & Social Media Links</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>GitHub Profile URL</label>
              <input
                type="url"
                name="github"
                placeholder="https://github.com/username"
                value={profile.socialLinks.github}
                onChange={handleSocialChange}
              />
            </div>

            <div className="form-group">
              <label>LinkedIn Profile URL</label>
              <input
                type="url"
                name="linkedin"
                placeholder="https://linkedin.com/in/username"
                value={profile.socialLinks.linkedin}
                onChange={handleSocialChange}
              />
            </div>

            <div className="form-group">
              <label>Twitter / X Profile URL</label>
              <input
                type="url"
                name="twitter"
                placeholder="https://x.com/username"
                value={profile.socialLinks.twitter}
                onChange={handleSocialChange}
              />
            </div>

            <div className="form-group">
              <label>Personal Portfolio Website</label>
              <input
                type="url"
                name="portfolio"
                placeholder="https://yourportfolio.com"
                value={profile.socialLinks.portfolio}
                onChange={handleSocialChange}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving Changes..." : "Save Profile & Picture 💾"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
