import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      {/* PROFESSIONAL NAVBAR */}
      <header className="home-header glass-card">
        <div className="home-brand">
          <span className="brand-logo-icon">🌐</span>
          <span className="brand-logo-text">SkillSphere</span>
          <span className="brand-tag">MERN Stack</span>
        </div>

        <nav className="home-nav-menu">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#architecture">Architecture</a>
        </nav>

        <div className="home-auth-btns">
          {currentUser ? (
            <Link to="/dashboard" className="btn-primary">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="home-hero">
        <div className="hero-left">
          <div className="badge-pill">
            <span>✨ Peer-to-Peer Skill Exchange Network</span>
          </div>

          <h1 className="hero-title">
            Exchange Skills. <br />
            <span className="gradient-text">Empower Growth.</span> <br />
            Zero Cost.
          </h1>

          <p className="hero-subtitle">
            SkillSphere connects developers and learners to trade skills through algorithmic matching, real-time messaging, and live video sessions.
          </p>

          <div className="hero-cta-group">
            <Link to={currentUser ? "/dashboard" : "/register"} className="btn-primary btn-hero">
              Start Swapping Skills
            </Link>
            <Link to={currentUser ? "/matches" : "/register"} className="btn-secondary btn-hero">
              Explore Matches
            </Link>
          </div>

          <div className="hero-metrics">
            <div className="metric-item">
              <strong>Smart Matching</strong>
              <span>Algorithmic Pairings</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <strong>Real-Time Chat</strong>
              <span>WebSocket Gateway</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <strong>Video Calls</strong>
              <span>Live HD Meetings</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="floating-showcase">
            <div className="floating-card glass-card card-float-1">
              <div className="float-icon icon-react">⚛️</div>
              <div>
                <strong>Teaches React.js</strong>
                <p>Wants: Node.js & MongoDB</p>
                <span className="match-tag">96% Match</span>
              </div>
            </div>

            <div className="floating-card glass-card card-float-2">
              <div className="float-icon icon-python">🐍</div>
              <div>
                <strong>Teaches Python</strong>
                <p>Wants: UI/UX Design</p>
                <span className="match-tag">92% Match</span>
              </div>
            </div>

            <div className="floating-card glass-card card-float-3">
              <div className="float-icon icon-chat">📹</div>
              <div>
                <strong>Live Video Call</strong>
                <p>Interactive Session</p>
                <span className="online-tag">🟢 Active</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-title-center">
          <span className="badge-accent">🔄 WORKFLOW</span>
          <h2>How SkillSphere Works</h2>
          <p>Learn new skills by sharing your expertise with others.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card glass-card">
            <div className="step-number">01</div>
            <h3>Create Profile</h3>
            <p>Set up your profile with the skills you offer and skills you want to learn.</p>
          </div>

          <div className="step-card glass-card">
            <div className="step-number">02</div>
            <h3>Skill Matching</h3>
            <p>Our algorithm finds peers whose learning goals match your skill set.</p>
          </div>

          <div className="step-card glass-card">
            <div className="step-number">03</div>
            <h3>Propose Swap & Chat</h3>
            <p>Send a swap proposal and communicate in real time using instant messaging.</p>
          </div>

          <div className="step-card glass-card">
            <div className="step-number">04</div>
            <h3>Schedule Video Call</h3>
            <p>Conduct live video sessions, share knowledge, and build peer reviews.</p>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="features-section">
        <div className="section-title-center">
          <span className="badge-accent">⚡ FEATURES</span>
          <h2>Essential Platform Capabilities</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-card">
            <span className="feature-icon">🤖</span>
            <h3>Recommendation Engine</h3>
            <p>Algorithmic calculation matching teaching and learning profiles.</p>
          </div>

          <div className="feature-card glass-card">
            <span className="feature-icon">💬</span>
            <h3>Real-Time Messaging</h3>
            <p>Socket.io messaging with active presence and typing indicators.</p>
          </div>

          <div className="feature-card glass-card">
            <span className="feature-icon">📹</span>
            <h3>HD Video Sessions</h3>
            <p>Scheduled 1-on-1 meeting links with one-click room creation.</p>
          </div>

          <div className="feature-card glass-card">
            <span className="feature-icon">⭐</span>
            <h3>Trust Ratings & Reviews</h3>
            <p>Peer review system to maintain community quality and trust.</p>
          </div>

          <div className="feature-card glass-card">
            <span className="feature-icon">👤</span>
            <h3>User Profiles</h3>
            <p>Custom portfolios highlighting skills, education, and social links.</p>
          </div>

          <div className="feature-card glass-card">
            <span className="feature-icon">🔒</span>
            <h3>Secure Authentication</h3>
            <p>Stateless JWT authentication and Bcrypt password security.</p>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-banner glass-card">
        <div className="cta-content">
          <h2>Ready to Start Swapping Skills?</h2>
          <p>Join SkillSphere today and connect with skill exchange partners.</p>
          <Link to={currentUser ? "/dashboard" : "/register"} className="btn-primary btn-hero">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer-new">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-logo-icon">🌐</span>
            <span className="brand-logo-text">SkillSphere</span>
            <p>Peer-to-Peer Skill Exchange Network.</p>
          </div>

          <div className="footer-tech">
            <strong>Built with MERN Stack:</strong>
            <span>MongoDB • Express • React • Node.js • Socket.io</span>
          </div>
        </div>

        <div className="footer-bottom">
          <small>© 2026 SkillSphere. All rights reserved.</small>
        </div>
      </footer>
    </div>
  );
}

export default Home;