import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Onboarding.css";

function Onboarding() {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Profile fields
  const [college, setCollege] = useState(currentUser?.college || "");
  const [course, setCourse] = useState(currentUser?.course || "");
  const [year, setYear] = useState(currentUser?.year || "");
  const [bio, setBio] = useState(currentUser?.bio || "");

  // Skills
  const [teachSkills, setTeachSkills] = useState(
    currentUser?.teachSkills?.map((s) => (typeof s === "string" ? s : s.name)) || []
  );
  const [learnSkills, setLearnSkills] = useState(
    currentUser?.learnSkills?.map((s) => (typeof s === "string" ? s : s.name)) || []
  );

  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addTeachSkill = () => {
    const skill = teachInput.trim();
    if (!skill) return;
    const alreadyExists = teachSkills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );
    if (!alreadyExists) {
      setTeachSkills([...teachSkills, skill]);
    }
    setTeachInput("");
  };

  const removeTeachSkill = (skill) => {
    setTeachSkills(teachSkills.filter((item) => item !== skill));
  };

  const addLearnSkill = () => {
    const skill = learnInput.trim();
    if (!skill) return;
    const alreadyExists = learnSkills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );
    if (!alreadyExists) {
      setLearnSkills([...learnSkills, skill]);
    }
    setLearnInput("");
  };

  const removeLearnSkill = (skill) => {
    setLearnSkills(learnSkills.filter((item) => item !== skill));
  };

  const handleNext = () => {
    setError("");

    if (step === 1) {
      if (!college || !course || !year) {
        setError("Please complete your college, course and year.");
        return;
      }
    }

    if (step === 2) {
      if (teachSkills.length === 0) {
        setError("Please add at least one skill you can teach.");
        return;
      }
    }

    setStep(step + 1);
  };

  const handleFinish = async () => {
    if (learnSkills.length === 0) {
      setError("Please add at least one skill you want to learn.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/onboarding", {
        college,
        course,
        year,
        bio,
        teachSkills: teachSkills.map((name) => ({ name, level: "Intermediate", category: "General" })),
        learnSkills: learnSkills.map((name) => ({ name, level: "Beginner", category: "General" })),
      });

      if (response.data && response.data.success) {
        updateUser(response.data.user);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {/* Progress */}
        <div className="onboarding-progress">
          <div className={`progress-step ${step >= 1 ? "active" : ""}`}>1</div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 2 ? "active" : ""}`}>2</div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step >= 3 ? "active" : ""}`}>3</div>
        </div>

        <p className="step-text">Step {step} of 3</p>

        {error && <div className="onboarding-error">{error}</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="onboarding-content">
            <div className="onboarding-icon">👤</div>
            <h1>Tell Us About Yourself</h1>
            <p>Complete your profile to help others know you better.</p>

            <div className="form-group">
              <label>College</label>
              <input
                type="text"
                placeholder="Enter your college name"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Course</label>
              <input
                type="text"
                placeholder="Example: BCA / B.Tech Computer Science"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Year</label>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Bio <span>(Optional)</span>
              </label>
              <textarea
                placeholder="Tell others a little about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="4"
              />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="onboarding-content">
            <div className="onboarding-icon">🧠</div>
            <h1>What Can You Teach?</h1>
            <p>Add skills that you can share with other learners.</p>

            <div className="skill-input-box">
              <input
                type="text"
                placeholder="Example: React"
                value={teachInput}
                onChange={(e) => setTeachInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTeachSkill();
                  }
                }}
              />
              <button type="button" onClick={addTeachSkill}>
                Add
              </button>
            </div>

            <div className="skills-container">
              {teachSkills.map((skill) => (
                <div className="onboarding-skill teach-skill" key={skill}>
                  {skill}
                  <button type="button" onClick={() => removeTeachSkill(skill)}>
                    ×
                  </button>
                </div>
              ))}
            </div>

            {teachSkills.length === 0 && (
              <p className="skill-help">Add at least one skill.</p>
            )}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="onboarding-content">
            <div className="onboarding-icon">📚</div>
            <h1>What Do You Want to Learn?</h1>
            <p>Add skills you want to learn from other SkillSphere users.</p>

            <div className="skill-input-box">
              <input
                type="text"
                placeholder="Example: Python"
                value={learnInput}
                onChange={(e) => setLearnInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addLearnSkill();
                  }
                }}
              />
              <button type="button" onClick={addLearnSkill}>
                Add
              </button>
            </div>

            <div className="skills-container">
              {learnSkills.map((skill) => (
                <div className="onboarding-skill learn-skill" key={skill}>
                  {skill}
                  <button type="button" onClick={() => removeLearnSkill(skill)}>
                    ×
                  </button>
                </div>
              ))}
            </div>

            {learnSkills.length === 0 && (
              <p className="skill-help">Add at least one skill.</p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="onboarding-buttons">
          {step > 1 && (
            <button
              className="back-btn"
              type="button"
              onClick={() => {
                setError("");
                setStep(step - 1);
              }}
            >
              ← Back
            </button>
          )}

          {step < 3 ? (
            <button className="next-btn" type="button" onClick={handleNext}>
              Next →
            </button>
          ) : (
            <button
              className="finish-btn"
              type="button"
              onClick={handleFinish}
              disabled={loading}
            >
              {loading ? "Finishing..." : "Finish & Find Matches 🎉"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;