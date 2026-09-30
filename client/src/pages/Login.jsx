import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);

      const user = await login(email, password);

      if (user.onboardingCompleted) {
        navigate("/dashboard");
      } else {
        navigate("/onboarding");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert("Google OAuth feature selected! You can sign in with your email & password.");
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
            <h1>Better Skills.<br />Brighter Future.</h1>
            <p>
              Join our peer-to-peer community and start exchanging skills with people who share your passions.
            </p>
          </div>

          {/* VECTOR ILLUSTRATION SVG */}
          <div className="illustration-box">
            <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="150" r="120" fill="#EEF2FF" />
              <path d="M120 220 H280 V230 H120 Z" fill="#6366F1" opacity="0.3" />
              {/* Desk & Laptop */}
              <rect x="110" y="190" width="180" height="12" rx="6" fill="#312E81" />
              <rect x="150" y="145" width="80" height="45" rx="5" fill="#1E1B4B" />
              <rect x="154" y="149" width="72" height="37" rx="3" fill="#818CF8" />
              <path d="M140 190 L150 178 H230 L240 190 Z" fill="#94A3B8" />
              {/* Books */}
              <rect x="250" y="170" width="35" height="8" rx="2" fill="#F43F5E" />
              <rect x="253" y="162" width="32" height="8" rx="2" fill="#10B981" />
              <rect x="251" y="154" width="34" height="8" rx="2" fill="#F59E0B" />
              {/* Plant */}
              <path d="M120 190 L125 170 H135 L140 190 Z" fill="#B45309" />
              <circle cx="130" cy="160" r="10" fill="#10B981" />
              <circle cx="124" cy="165" r="8" fill="#059669" />
              <circle cx="136" cy="165" r="8" fill="#059669" />
              {/* Paper Plane */}
              <path d="M260 90 L290 70 L275 105 L268 95 Z" fill="#6366F1" />
            </svg>
          </div>
        </div>

        {/* RIGHT PANEL: LOGIN FORM CARD */}
        <div className="auth-right-panel">
          <h1 className="auth-form-title">Login</h1>
          <p className="auth-form-subtitle">Enter your credentials to get started.</p>

          {error && (
            <div className="auth-error-alert">
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form-body">
            <div className="input-field-group">
              <label>Email address</label>
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
              <label>Password</label>
              <div className="input-wrapper">
                <span className="field-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-pwd-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="auth-options-row">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>

              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact support or register a new account to reset credentials."); }} className="forgot-link">
                Forgot password?
              </a>
            </div>

            <button type="submit" disabled={loading} className="btn-auth-submit">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button type="button" className="btn-google-auth" onClick={handleGoogleLogin}>
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
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;