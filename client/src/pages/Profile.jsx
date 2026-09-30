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
        setMessage("📷 Profile photo loaded! Click 'Save Profile' to apply changes.");
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
    <div className="profile-page-wrapper">
      {/* 1. HERO COVER BANNER */}
      <section className="profile-cover-card">
        <div className="profile-cover-banner"></div>
        <div className="profile-cover-body">
          <div className="avatar-preview-box">
            <Avatar src={avatarPreview} name={profile.name} size="huge" />
            <button
              type="button"
              className="btn-camera-overlay"
              onClick={() => fileInputRef.current?.click()}
              title="Change Profile Photo"
            >
              📷
            </button>
          </div>

          <div className="profile-header-details">
            <h1 className="profile-user-name">{profile.name || "Student Profile"}</h1>
            <p className="profile-user-email">✉️ {currentUser?.email}</p>
            <div className="profile-badge-tags">
              <span className="badge-tag college-badge">
                🎓 {profile.college || "University Student"}{" "}
                {profile.course ? `• ${profile.course}` : ""}
              </span>
              {profile.year && <span className="badge-tag year-badge">📅 {profile.year}</span>}
              {profile.location && <span className="badge-tag loc-badge">📍 {profile.location}</span>}
            </div>

            <div className="photo-actions-row">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="btn-photo-upload"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo 📷
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  className="btn-photo-remove"
                  onClick={handleRemovePhoto}
                >
                  Remove Photo ✕
                </button>
              )}
            </div>
          </div>

          <div className="trust-rating-box">
            <span className="trust-val">⭐ {currentUser?.rating?.average || "5.0"}</span>
            <span className="trust-lbl">Peer Trust Score</span>
          </div>
        </div>
      </section>

      {message && <div className="profile-toast-alert">{message}</div>}

      {/* 2. EDIT PROFILE FORM */}
      <form onSubmit={handleSubmit} className="profile-form-grid">
        {/* SECTION 1: PERSONAL INFORMATION */}
        <div className="profile-section-card">
          <div className="card-section-title">
            <span className="title-icon">👤</span>
            <div>
              <h3>Personal Information</h3>
              <p>Manage your public display name, location, and bio</p>
            </div>
          </div>

          <div className="form-fields-grid">
            <div className="field-block">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="field-block">
              <label>Location / City</label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Patna, Bihar / Remote"
                value={profile.location}
                onChange={handleChange}
              />
            </div>

            <div className="field-block full-width">
              <label>Personal Bio & Learning Goals</label>
              <textarea
                rows="3"
                name="bio"
                placeholder="Tell other students about your passions, skills, and project goals..."
                value={profile.bio}
                onChange={handleChange}
              />
              <small className="field-hint">Brief introduction displayed on your public partner card</small>
            </div>
          </div>
        </div>

        {/* SECTION 2: ACADEMIC & EDUCATION */}
        <div className="profile-section-card">
          <div className="card-section-title">
            <span className="title-icon">🎓</span>
            <div>
              <h3>Education & Campus Details</h3>
              <p>Used to match you with peers in your college or major</p>
            </div>
          </div>

          <div className="form-fields-grid">
            <div className="field-block">
              <label>College / University</label>
              <input
                type="text"
                name="college"
                placeholder="e.g. Patna University / IIT"
                value={profile.college}
                onChange={handleChange}
              />
            </div>

            <div className="field-block">
              <label>Course / Major</label>
              <input
                type="text"
                name="course"
                placeholder="e.g. BCA / B.Tech Computer Science"
                value={profile.course}
                onChange={handleChange}
              />
            </div>

            <div className="field-block">
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

        {/* SECTION 3: SKILLS PREVIEW */}
        <div className="profile-section-card">
          <div className="card-section-title">
            <span className="title-icon">🧠</span>
            <div>
              <h3>Active Skills Portfolio</h3>
              <p>Skills you offer to teach and skills you want to learn</p>
            </div>
          </div>

          <div className="skills-overview-container">
            <div className="skills-overview-column">
              <span className="column-label label-teach">Teaches (Skills Offered):</span>
              <div className="pills-cloud">
                {currentUser?.teachSkills?.length > 0 ? (
                  currentUser.teachSkills.map((s, idx) => (
                    <span key={idx} className="pill-chip chip-teach">
                      {s.name || s}
                    </span>
                  ))
                ) : (
                  <span className="no-skills-tag">No teaching skills added yet</span>
                )}
              </div>
            </div>

            <div className="skills-overview-column">
              <span className="column-label label-learn">Wants to Learn:</span>
              <div className="pills-cloud">
                {currentUser?.learnSkills?.length > 0 ? (
                  currentUser.learnSkills.map((s, idx) => (
                    <span key={idx} className="pill-chip chip-learn">
                      {s.name || s}
                    </span>
                  ))
                ) : (
                  <span className="no-skills-tag">No learning goals added yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: SOCIAL & PORTFOLIO LINKS */}
        <div className="profile-section-card">
          <div className="card-section-title">
            <span className="title-icon">🌐</span>
            <div>
              <h3>Portfolio & Social Links</h3>
              <p>Help peer partners verify your projects and code repositories</p>
            </div>
          </div>

          <div className="form-fields-grid">
            <div className="field-block">
              <label>GitHub Profile URL</label>
              <input
                type="url"
                name="github"
                placeholder="https://github.com/username"
                value={profile.socialLinks.github}
                onChange={handleSocialChange}
              />
            </div>

            <div className="field-block">
              <label>LinkedIn Profile URL</label>
              <input
                type="url"
                name="linkedin"
                placeholder="https://linkedin.com/in/username"
                value={profile.socialLinks.linkedin}
                onChange={handleSocialChange}
              />
            </div>

            <div className="field-block">
              <label>Twitter / X Profile URL</label>
              <input
                type="url"
                name="twitter"
                placeholder="https://x.com/username"
                value={profile.socialLinks.twitter}
                onChange={handleSocialChange}
              />
            </div>

            <div className="field-block">
              <label>Personal Website / Portfolio</label>
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

        <div className="profile-actions-bar">
          <button type="submit" disabled={saving} className="btn-save-profile">
            {saving ? "Saving Changes..." : "Save Profile & Picture 💾"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
