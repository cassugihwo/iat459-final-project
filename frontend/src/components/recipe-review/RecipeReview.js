import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecipeReview.css";

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="rr-star-picker">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`rr-star-btn${n <= (hover || value) ? " active" : ""}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewStars({ rating }) {
  return (
    <span className="rr-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? "rr-star-filled" : "rr-star-empty"}>
          ★
        </span>
      ))}
    </span>
  );
}

const REVIEWS_PREVIEW = 3;

// type="recipe"      → /api/reviews/:recipeId        (Spoonacular recipes)
// type="user-recipe" → /api/reviews/user-recipe/:id  (user-created recipes)
function RecipeReview({ recipeId, token, user, type = "recipe" }) {
  const navigate = useNavigate();

  const apiBase =
    type === "user-recipe"
      ? `http://localhost:5001/api/reviews/user-recipe/${recipeId}`
      : `http://localhost:5001/api/reviews/${recipeId}`;

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [userAvatar, setUserAvatar] = useState("");

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(apiBase);
        if (!res.ok) return;
        const data = await res.json();
        setReviews(data);
        if (data.length) {
          setAvgRating(
            parseFloat(
              (data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(1),
            ),
          );
        }
      } catch (err) {}
    }
    fetchReviews();
  }, [apiBase]);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5001/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.avatar) setUserAvatar(data.avatar); })
      .catch(() => {});
  }, [token]);

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!newRating) {
      setReviewError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setReviewError("");
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: newRating, comment: newComment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review.");
      const updated = [data, ...reviews];
      setReviews(updated);
      setAvgRating(
        parseFloat(
          (updated.reduce((s, r) => s + r.rating, 0) / updated.length).toFixed(1),
        ),
      );
      setNewRating(0);
      setNewComment("");
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    try {
      await fetch(`http://localhost:5001/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = reviews.filter((r) => r._id !== reviewId);
      setReviews(updated);
      setAvgRating(
        updated.length
          ? parseFloat(
              (updated.reduce((s, r) => s + r.rating, 0) / updated.length).toFixed(1),
            )
          : 0,
      );
    } catch (err) {}
  }

  return (
    <div className="rr-section">
      <h2 className="rr-section-title">Rating</h2>

      <div className="rr-rating-summary">
        <div className="rr-rating-summary-left">
          <span className="rr-rating-big">
            {reviews.length > 0 ? avgRating : "0"}
          </span>
          <ReviewStars rating={reviews.length > 0 ? Math.round(avgRating) : 0} />
          <span className="rr-review-count">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="rr-rating-bars">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const pct = reviews.length
              ? Math.round((count / reviews.length) * 100)
              : 0;
            return (
              <div key={star} className="rr-bar-row">
                <span className="rr-bar-label">{star}</span>
                <div className="rr-bar-track">
                  <div className="rr-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="rr-bar-pct">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <h2 className="rr-section-title" style={{ marginTop: "2rem" }}>Reviews</h2>

      {reviews.length === 0 ? (
        <p className="rr-no-reviews">No reviews yet. Be the first!</p>
      ) : (
        <>
          <div className="rr-review-list">
            {(reviewsExpanded ? reviews : reviews.slice(0, REVIEWS_PREVIEW)).map((r) => {
              const initials = r.username.slice(0, 2).toUpperCase();
              const avatar = r.owner?.avatar;
              return (
                <div key={r._id} className="rr-review-item">
                  <div className="rr-review-header">
                    <div className="rr-review-avatar">
                      {avatar ? (
                        <img src={avatar} alt={r.username} className="rr-review-avatar-img" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="rr-review-meta">
                      <span className="rr-review-username">{r.username}</span>
                      <span className="rr-review-date">
                        {new Date(r.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {user?.username === r.username && (
                      <button
                        className="rr-review-delete"
                        onClick={() => handleDeleteReview(r._id)}
                        aria-label="Delete review"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <ReviewStars rating={r.rating} />
                  {r.comment && <p className="rr-review-comment">{r.comment}</p>}
                </div>
              );
            })}
          </div>
          {reviews.length > REVIEWS_PREVIEW && (
            <button
              className="rr-reviews-toggle"
              onClick={() => setReviewsExpanded((prev) => !prev)}
            >
              {reviewsExpanded
                ? "Show less ▲"
                : `Show all ${reviews.length} reviews ▼`}
            </button>
          )}
        </>
      )}

      {token ? (
        <div className="rr-review-item rr-review-form-card">
          <div className="rr-review-header">
            <div className="rr-review-avatar">
              {userAvatar ? (
                <img src={userAvatar} alt={user?.username} className="rr-review-avatar-img" />
              ) : (
                user?.username?.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="rr-review-meta">
              <span className="rr-review-username">{user?.username}</span>
              <span className="rr-review-date">Your review</span>
            </div>
          </div>
          <form onSubmit={handleSubmitReview}>
            <StarPicker value={newRating} onChange={setNewRating} />
            <textarea
              className="rr-review-textarea"
              placeholder="Share your thoughts (optional)..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            {reviewError && <p className="rr-review-error">{reviewError}</p>}
            <button className="rr-review-submit" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      ) : (
        <div className="rr-review-item rr-review-login-card">
          <div className="rr-review-header">
            <div className="rr-review-avatar">?</div>
            <div className="rr-review-meta">
              <span className="rr-review-username">Guest</span>
              <span className="rr-review-date">Your review</span>
            </div>
          </div>
          <p className="rr-review-login">
            <button className="rr-review-login-btn" onClick={() => navigate("/login")}>
              Log in
            </button>{" "}
            to leave a review.
          </p>
        </div>
      )}
    </div>
  );
}

export default RecipeReview;
