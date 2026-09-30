import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [college, setCollege] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);

      await register(name, email, password, college, course, year);
      navigate("/onboarding");
    } catch (err) {
      console.error("Register error:", err);
      setError(err.response?.data?.message || err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    alert("Google OAuth selected! You can register using the fields below.");
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-split-card">
        {/* LEFT PANEL: BRANDING & ILLUSTRATION */}
        <div className="auth-left-panel">
          <div className="brand-header">
            <div className="brand-logo-icon">🔮</div>
            <div className="brand-title-group">
              <h2>SkillSphere</h2>
              <p>Share Skills. Learn Together.</p>
            </div>
          </div>

          <div className="hero-tagline">
            <h1>Build Your<br />Skill Network.</h1>
            <p>
              Connect with fellow students, swap tech & creative skills, and elevate your career portfolio together.
            </p>
          </div>

          {/* VECTOR ILLUSTRATION SVG */}
          <div className="illustration-box">
            <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="150" r="120" fill="#EEF2FF" />
              <rect x="120" y="210" width="160" height="10" rx="5" fill="#6366F1" opacity="0.3" />
              {/* Student Figure */}
              <circle cx="200" cy="110" r="30" fill="#818CF8" />
              <path d="M150 200 C150 160, 250 160, 250 200 Z" fill="#4F46E5" />
              <rect x="175" y="160" width="50" height="30" rx="4" fill="#312E81" />
              {/* Floating Skill Badges */}
              <rect x="100" y="80" width="70" height="26" rx="13" fill="#10B981" />
              <text x="135" y="97" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">React 💻</text>
              <rect x="230" y="90" width="70" height="26" rx="13" fill="#F59E0B" />
              <text x="265" y="107" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">Design 🎨</text>
            </svg>
          </div>
        </div>

        {/* RIGHT PANEL: REGISTER FORM CARD */}
        <div className="auth-right-panel">
          <h1 className="auth-form-title">Create Account</h1>
          <p className="auth-form-subtitle">Enter your details to join SkillSphere.</p>

          {error && (
            <div className="auth-error-alert">
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleRegister} className="auth-form-body">
            <div className="input-field-group">
              <label>Full Name *</label>
              <div className="input-wrapper">
                <span className="field-icon">👤</span>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-field-group">
              <label>Email address *</label>
              <div className="input-wrapper">
                <span className="field-icon">✉️</span>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-field-group">
              <label>Password *</label>
              <div className="input-wrapper">
                <span className="field-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="toggle-pwd-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="input-field-group">
              <label>College / University (Optional)</label>
              <div className="input-wrapper">
                <span className="field-icon">🎓</span>
                <input
                  type="text"
                  placeholder="e.g. Patna University"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>
            </div>

            <div className="input-field-group">
              <label>Course / Major (Optional)</label>
              <div className="input-wrapper">
                <span className="field-icon">📚</span>
                <input
                  type="text"
                  placeholder="e.g. BCA / B.Tech Computer Science"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </div>
            </div>

            <div className="input-field-group">
              <label>Academic Year (Optional)</label>
              <div className="input-wrapper">
                <span className="field-icon">📅</span>
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  <option value="">Select Academic Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-auth-submit">
              {loading ? "Creating Account..." : "Register Account"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button type="button" className="btn-google-auth" onClick={handleGoogleRegister}>
            <svg className="google-icon" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="auth-footer-prompt">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;