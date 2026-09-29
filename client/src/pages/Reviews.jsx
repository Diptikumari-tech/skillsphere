import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Reviews.css";

function Reviews() {
  const { currentUser } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);

  // Modal State for submitting a review
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [revieweeId, setRevieweeId] = useState("");
  const [rating, setRating] = useState(5);
  const [skillName, setSkillName] = useState("Skill Swap");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchReviewsData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reviews");
      if (res.data && res.data.success) {
        setReviews(res.data.reviews || []);
      }

      // Load active chats/connections to populate peer dropdown
      const connRes = await api.get("/chats").catch(() => ({ data: { chats: [] } }));
      const activeChats = connRes.data?.chats || [];
      const peers = activeChats.map((c) => c.participants.find((p) => p._id !== currentUser._id)).filter(Boolean);
      setConnections(peers);
      if (peers.length > 0) setRevieweeId(peers[0]._id);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setMessage("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, []);

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!revieweeId || !comment.trim()) return;

    try {
      setSubmitting(true);
      setMessage("");

      const res = await api.post("/reviews", {
        revieweeId,
        rating: Number(rating),
        skillName,
        comment,
      });

      if (res.data && res.data.success) {
        setMessage("🎉 Review & rating submitted successfully!");
        setComment("");
        setShowReviewModal(false);
        fetchReviewsData();
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setMessage(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate Average Rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  if (loading) {
    return (
      <div className="reviews-loading glass-card">
        <div className="loader"></div>
        <h2>Loading Reviews & Ratings...</h2>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      {/* HERO BANNER */}
      <section className="reviews-hero glass-card">
        <div>
          <span className="badge-accent">⭐ Peer Verification</span>
          <h1>
            Peer <span className="highlight-name">Reviews & Trust Ratings</span>
          </h1>
          <p>
            Build your reputational score on SkillSphere by completing skill exchanges and receiving peer feedback.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowReviewModal(true)}>
          ⭐ Write a Peer Review
        </button>
      </section>

      {message && <div className="reviews-alert">{message}</div>}

      {/* RATING SUMMARY CARD */}
      <section className="rating-summary-card glass-card">
        <div className="summary-left">
          <span className="big-rating-number">{avgRating}</span>
          <div className="stars-display">{"⭐".repeat(Math.round(Number(avgRating)))}</div>
          <p>Based on {reviews.length} Peer Feedback Reviews</p>
        </div>

        <div className="summary-bars">
          <div className="bar-row">
            <span>5 Stars</span>
            <div className="bar-track"><div className="bar-fill" style={{ width: "85%" }}></div></div>
          </div>
          <div className="bar-row">
            <span>4 Stars</span>
            <div className="bar-track"><div className="bar-fill" style={{ width: "15%" }}></div></div>
          </div>
          <div className="bar-row">
            <span>3 Stars</span>
            <div className="bar-track"><div className="bar-fill" style={{ width: "0%" }}></div></div>
          </div>
        </div>
      </section>

      {/* REVIEWS CARDS GRID */}
      <div className="reviews-grid">
        {reviews.length === 0 ? (
          <div className="empty-state glass-card" style={{ gridColumn: "1/-1" }}>
            <span className="empty-icon">⭐</span>
            <h3>No reviews received yet</h3>
            <p>Complete learning sessions with your partners to receive trust ratings!</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="review-card glass-card">
              <div className="review-card-top">
                <div className="reviewer-info">
                  <div className="avatar-small">
                    {r.reviewer?.name ? r.reviewer.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h4>{r.reviewer?.name || "Peer Partner"}</h4>
                    <small>{r.reviewer?.college || "SkillSphere User"}</small>
                  </div>
                </div>

                <div className="review-stars-badge">
                  {"⭐".repeat(r.rating)} ({r.rating}/5)
                </div>
              </div>

              <p className="review-comment">"{r.comment}"</p>

              <div className="review-card-footer">
                <span className="skill-tag-pill">Skill: {r.skillName}</span>
                <small className="review-date">
                  {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SUBMIT REVIEW MODAL DIALOG */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⭐ Write Peer Feedback</h2>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>
                ×
              </button>
            </div>

            {connections.length === 0 ? (
              <div className="empty-mini">
                <p>You need active skill connections to submit reviews!</p>
                <button className="btn-secondary" onClick={() => setShowReviewModal(false)}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateReview} className="review-form">
                <div className="form-group">
                  <label>Select Peer Partner:</label>
                  <select
                    value={revieweeId}
                    onChange={(e) => setRevieweeId(e.target.value)}
                    required
                  >
                    {connections.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.college || "Peer"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Skill Name Swapped:</label>
                  <input
                    type="text"
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Rating (1 to 5 Stars):</label>
                  <select value={rating} onChange={(e) => setRating(e.target.value)}>
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5) - Excellent</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5) - Very Good</option>
                    <option value={3}>⭐⭐⭐ (3/5) - Good</option>
                    <option value={2}>⭐⭐ (2/5) - Fair</option>
                    <option value={1}>⭐ (1/5) - Needs Improvement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Written Testimonial:</label>
                  <textarea
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your learning experience and punctuality of the peer..."
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowReviewModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? "Submitting..." : "Submit Review ⭐"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Reviews;