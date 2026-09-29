import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Skills.css";

function Skills() {
  const { currentUser, updateUser } = useAuth();

  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);

  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");
  const [teachLevel, setTeachLevel] = useState("Intermediate");
  const [learnLevel, setLearnLevel] = useState("Beginner");
  const [teachCategory, setTeachCategory] = useState("Development");
  const [learnCategory, setLearnCategory] = useState("Development");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const categories = [
    "Development",
    "Programming Languages",
    "Artificial Intelligence",
    "Data Science & Analytics",
    "UI/UX Design",
    "Cloud & DevOps",
    "Cyber Security",
    "Digital Marketing",
    "Business & Product",
  ];

  const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];

  useEffect(() => {
    if (currentUser) {
      setTeachSkills(currentUser.teachSkills || []);
      setLearnSkills(currentUser.learnSkills || []);
      setLoading(false);
    }
  }, [currentUser]);

  const addTeachSkill = () => {
    const name = teachInput.trim();
    if (!name) return;

    if (teachSkills.some((s) => (s.name || s).toLowerCase() === name.toLowerCase())) {
      setMessage("This teaching skill is already in your profile.");
      return;
    }

    setTeachSkills([...teachSkills, { name, level: teachLevel, category: teachCategory }]);
    setTeachInput("");
    setMessage("");
  };

  const addLearnSkill = () => {
    const name = learnInput.trim();
    if (!name) return;

    if (learnSkills.some((s) => (s.name || s).toLowerCase() === name.toLowerCase())) {
      setMessage("This learning skill is already in your profile.");
      return;
    }

    setLearnSkills([...learnSkills, { name, level: learnLevel, category: learnCategory }]);
    setLearnInput("");
    setMessage("");
  };

  const removeTeachSkill = (skillName) => {
    setTeachSkills(teachSkills.filter((s) => (s.name || s) !== skillName));
  };

  const removeLearnSkill = (skillName) => {
    setLearnSkills(learnSkills.filter((s) => (s.name || s) !== skillName));
  };

  const saveSkills = async () => {
    try {
      setSaving(true);
      setMessage("");

      const response = await api.put("/users/profile", {
        teachSkills,
        learnSkills,
      });

      if (response.data && response.data.success) {
        updateUser(response.data.user);
        setMessage("🎉 Your skill profile has been updated successfully!");
      }
    } catch (error) {
      console.error("Error saving skills:", error);
      setMessage(error.response?.data?.message || "Failed to save skills.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="skills-loading glass-card">
        <div className="loader"></div>
        <h2>Loading Your Skills...</h2>
      </div>
    );
  }

  return (
    <div className="skills-container">
      {/* HERO BANNER */}
      <section className="skills-hero glass-card">
        <div>
          <span className="badge-accent">🧠 Skill Portfolio</span>
          <h1>
            Manage Your <span className="highlight-name">Teaching & Learning</span> Skills
          </h1>
          <p>
            Accurate skill profiles dramatically increase your match score with relevant study partners.
          </p>
        </div>

        <button className="btn-primary" onClick={saveSkills} disabled={saving}>
          {saving ? "Saving Changes..." : "Save Skill Profile 💾"}
        </button>
      </section>

      {message && <div className="skills-alert">{message}</div>}

      {/* SKILLS SPLIT SECTIONS */}
      <div className="skills-sections-grid">
        {/* SECTION 1: SKILLS I CAN TEACH */}
        <div className="skills-card glass-card">
          <div className="skills-card-header">
            <div>
              <h2>🎓 Skills I Can Teach</h2>
              <p>Share your expertise with learners in exchange for new skills.</p>
            </div>
            <span className="count-pill pill-teach">{teachSkills.length} Offered</span>
          </div>

          {/* ADD FORM */}
          <div className="add-skill-box">
            <div className="form-group">
              <input
                type="text"
                placeholder="Skill name (e.g. React, Python, Figma)..."
                value={teachInput}
                onChange={(e) => setTeachInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTeachSkill())}
              />
            </div>

            <div className="form-row">
              <select value={teachCategory} onChange={(e) => setTeachCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select value={teachLevel} onChange={(e) => setTeachLevel(e.target.value)}>
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              <button type="button" onClick={addTeachSkill} className="btn-primary">
                + Add
              </button>
            </div>
          </div>

          {/* SKILL CARDS LIST */}
          <div className="skill-cards-list">
            {teachSkills.length === 0 ? (
              <div className="empty-skills-state">
                <span>💡</span>
                <p>No teaching skills added yet. Add skills you master above!</p>
              </div>
            ) : (
              teachSkills.map((s, idx) => {
                const name = s.name || s;
                return (
                  <div key={idx} className="skill-item-card">
                    <div className="skill-item-info">
                      <h4>{name}</h4>
                      <div className="skill-item-meta">
                        <span className="tag-cat">{s.category || "Development"}</span>
                        <span className="tag-level">{s.level || "Intermediate"}</span>
                      </div>
                    </div>
                    <button
                      className="delete-skill-btn"
                      onClick={() => removeTeachSkill(name)}
                      title="Remove Skill"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION 2: SKILLS I WANT TO LEARN */}
        <div className="skills-card glass-card">
          <div className="skills-card-header">
            <div>
              <h2>📚 Skills I Want to Learn</h2>
              <p>Skills you want to master through peer mentorship.</p>
            </div>
            <span className="count-pill pill-learn">{learnSkills.length} Desired</span>
          </div>

          {/* ADD FORM */}
          <div className="add-skill-box">
            <div className="form-group">
              <input
                type="text"
                placeholder="Skill name (e.g. Node.js, Machine Learning)..."
                value={learnInput}
                onChange={(e) => setLearnInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLearnSkill())}
              />
            </div>

            <div className="form-row">
              <select value={learnCategory} onChange={(e) => setLearnCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select value={learnLevel} onChange={(e) => setLearnLevel(e.target.value)}>
                {levels.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              <button type="button" onClick={addLearnSkill} className="btn-primary">
                + Add
              </button>
            </div>
          </div>

          {/* SKILL CARDS LIST */}
          <div className="skill-cards-list">
            {learnSkills.length === 0 ? (
              <div className="empty-skills-state">
                <span>🎯</span>
                <p>No learning goals added yet. Add skills you want to learn!</p>
              </div>
            ) : (
              learnSkills.map((s, idx) => {
                const name = s.name || s;
                return (
                  <div key={idx} className="skill-item-card">
                    <div className="skill-item-info">
                      <h4>{name}</h4>
                      <div className="skill-item-meta">
                        <span className="tag-cat">{s.category || "Development"}</span>
                        <span className="tag-level">{s.level || "Beginner"}</span>
                      </div>
                    </div>
                    <button
                      className="delete-skill-btn"
                      onClick={() => removeLearnSkill(name)}
                      title="Remove Skill"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skills;
