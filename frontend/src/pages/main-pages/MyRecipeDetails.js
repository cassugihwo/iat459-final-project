import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import Navbar from "components/navbar/UI_Navbar";
import Footer from "components/footer/UI_Footer";
import Toast from "components/toast/UI_Toast";
import { useAuth } from "context/AuthContext";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";
import "pages/page-css/MyRecipeDetail.css";

function parseRecipe(recipe) {
  const lines = (recipe.instructions || "").split("\n");
  const metaLine = lines[0] || "";

  const servesMatch = metaLine.match(/Serves:\s*(\d+)/);
  const cookMatch = metaLine.match(/Cook:\s*(\d+)\s*min/);
  const tagMatch = metaLine.match(/Tags:\s*([^|]+)/);

  const serves = servesMatch ? servesMatch[1] : null;
  const cookTime = cookMatch ? cookMatch[1] : null;
  const tags = tagMatch
    ? tagMatch[1]
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const steps = lines
    .slice(2)
    .map((l) => l.trim())
    .filter(Boolean);

  const ingredients = (recipe.ingredients || "")
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

  return { serves, cookTime, tags, steps, ingredients };
}

// Splits "2 cups flour" → { amount: "2 cups", name: "flour" }
function parseIngredient(str) {
  const match = str.match(
    /^(\d[\d/.\s]*(?:cups?|tbsp?|tsp?|oz|lbs?|g|kg|ml|l|cloves?|pieces?|slices?|cans?|bunches?|handful|pinch|dash|to taste)?)\s+(.+)/i,
  );
  if (match) {
    return { amount: match[1].trim(), name: match[2].trim() };
  }
  return { amount: "—", name: str };
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-btn${n <= (hover || value) ? " active" : ""}`}
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
    <span className="review-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? "star-filled" : "star-empty"}>
          ★
        </span>
      ))}
    </span>
  );
}

function MyRecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [userAvatar, setUserAvatar] = useState("");
  const REVIEWS_PREVIEW = 3;

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const res = await fetch(
          `http://localhost:5001/api/user-recipes2/${id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load recipe.");
        setRecipe(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipe();
  }, [id, token]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(
          `http://localhost:5001/api/reviews/user-recipe/${id}`,
        );
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
  }, [id]);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5001/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.avatar) setUserAvatar(data.avatar);
      })
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
      const res = await fetch(
        `http://localhost:5001/api/reviews/user-recipe/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating: newRating, comment: newComment.trim() }),
        },
      );
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

  const parsed = recipe ? parseRecipe(recipe) : null;

  const createdDate = recipe?.createdAt
    ? new Date(recipe.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="home-page">
      <div className="navbarHeader">
        <NavbarHeader />
      </div>

      <div className="bg">
        <div className="bg-food bg-food-left">
          <img src={leftDish} alt="" />
        </div>
        <div className="bg-food bg-food-center">
          <img src={centerDish} alt="" />
        </div>
        <div className="bg-food bg-food-right">
          <img src={rightDish} alt="" />
        </div>
        <div className="bg-logo">
          <img src={logo} alt="YumMeal Logo" />
        </div>
        <div className="bg-gradient"></div>
      </div>

      <div className="main">
        <div className="navbar">
          <Navbar />
        </div>

        <div className="main-content">
          <div className="mrd-back-bar">
            <button className="mrd-back-btn" onClick={() => navigate(-1)}>
              <span className="mrd-back-arrow">←</span> Back
            </button>
          </div>

          {loading && <p className="mrd-loading">Loading recipe...</p>}
          <Toast message={error} onClose={() => setError("")} />

          {recipe && parsed && (
            <div className="mrd-content">
              {/* Hero image */}
              <div className="mrd-hero">
                {recipe.image ? (
                  <img src={recipe.image} alt={recipe.name} />
                ) : (
                  <div className="mrd-hero-placeholder">
                    <img src={logo} alt="YumMeal" />
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="mrd-title">{recipe.name}</h1>

              {/*Tag*/}
              <div className="mrd-meta">
                {parsed.serves && (
                  <span className="mrd-chip highlight">Serves {parsed.serves}</span>
                )}
                {parsed.cookTime && (
                  <span className="mrd-chip highlight">{parsed.cookTime} min</span>
                )}
                {parsed.cookTime && (
                  <span className="mrd-chip highlight">
                    {parseInt(parsed.cookTime) <= 30
                      ? "Easy"
                      : parseInt(parsed.cookTime) <= 60
                        ? "Medium"
                        : "Hard"}
                  </span>
                )}
                {parsed.tags.map((tag, i) => (
                  <span key={i} className="mrd-chip">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Owner + Date */}
              <div className="mrd-owner-row">
                {recipe.owner?.avatar ? (
                  <img
                    src={recipe.owner.avatar}
                    alt={recipe.owner.username}
                    className="mrd-owner-avatar"
                  />
                ) : (
                  <div className="mrd-owner-avatar mrd-owner-initials">
                    {recipe.owner?.username?.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="mrd-owner-name">{recipe.owner?.username}</p>
                  <p className="mrd-owner-date">Created {createdDate}</p>
                </div>
              </div>

              <div className="mrd-body">
                {/* Ingredients */}
                <div className="mrd-ingredients-section">
                  <h2 className="mrd-section-title">Ingredients</h2>
                  <div className="mrd-ingredients-columns">
                    <div className="mrd-ingredients-col">
                      <p className="mrd-col-label">Item</p>
                      <ul className="mrd-ingredients">
                        {parsed.ingredients.map((ing, i) => (
                          <li key={i} className="mrd-ingredient-name">
                            <span>{parseIngredient(ing).name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mrd-ingredients-col">
                      <p className="mrd-col-label">Amount</p>
                      <ul className="mrd-ingredients">
                        {parsed.ingredients.map((ing, i) => (
                          <li key={i} className="mrd-ingredient-amount">
                            {parseIngredient(ing).amount}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mrd-instructions-section">
                  <h2 className="mrd-section-title">Instructions</h2>
                  {parsed.steps.length === 0 ? (
                    <p style={{ color: "#888", fontFamily: "Noto Sans, sans-serif" }}>
                      No instructions available.
                    </p>
                  ) : (
                    <div className="mrd-steps">
                      {parsed.steps.map((step, i) => (
                        <div key={i} className="mrd-step">
                          <span className="mrd-step-number">{i + 1}</span>
                          <p className="mrd-step-text">{step}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews section */}
              <div className="mrd-reviews-section">
                <h2 className="mrd-section-title">Rating</h2>

                <div className="mrd-rating-summary">
                  <div className="mrd-rating-summary-left">
                    <span className="mrd-rating-big">
                      {reviews.length > 0 ? avgRating : "0"}
                    </span>
                    <ReviewStars
                      rating={reviews.length > 0 ? Math.round(avgRating) : 0}
                    />
                    <span className="mrd-review-count">
                      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="mrd-rating-bars">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviews.filter((r) => r.rating === star).length;
                      const pct = reviews.length
                        ? Math.round((count / reviews.length) * 100)
                        : 0;
                      return (
                        <div key={star} className="mrd-rating-bar-row">
                          <span className="mrd-bar-label">{star}</span>
                          <div className="mrd-bar-track">
                            <div
                              className="mrd-bar-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="mrd-bar-pct">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <h2 className="mrd-section-title" style={{ marginTop: "2rem" }}>
                  Reviews
                </h2>

                {reviews.length === 0 ? (
                  <p className="mrd-no-reviews">No reviews yet. Be the first!</p>
                ) : (
                  <>
                    <div className="mrd-review-list">
                      {(reviewsExpanded
                        ? reviews
                        : reviews.slice(0, REVIEWS_PREVIEW)
                      ).map((r) => {
                        const initials = r.username.slice(0, 2).toUpperCase();
                        const avatar = r.owner?.avatar;
                        return (
                          <div key={r._id} className="mrd-review-item">
                            <div className="mrd-review-header">
                              <div className="mrd-review-avatar">
                                {avatar ? (
                                  <img
                                    src={avatar}
                                    alt={r.username}
                                    className="mrd-review-avatar-img"
                                  />
                                ) : (
                                  initials
                                )}
                              </div>
                              <div className="mrd-review-meta">
                                <span className="mrd-review-username">
                                  {r.username}
                                </span>
                                <span className="mrd-review-date">
                                  {new Date(r.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    },
                                  )}
                                </span>
                              </div>
                              {user?.username === r.username && (
                                <button
                                  className="mrd-review-delete"
                                  onClick={() => handleDeleteReview(r._id)}
                                  aria-label="Delete review"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                            <ReviewStars rating={r.rating} />
                            {r.comment && (
                              <p className="mrd-review-comment">{r.comment}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {reviews.length > REVIEWS_PREVIEW && (
                      <button
                        className="mrd-reviews-toggle"
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
                  <div className="mrd-review-item mrd-review-form-card">
                    <div className="mrd-review-header">
                      <div className="mrd-review-avatar">
                        {userAvatar ? (
                          <img
                            src={userAvatar}
                            alt={user?.username}
                            className="mrd-review-avatar-img"
                          />
                        ) : (
                          user?.username?.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="mrd-review-meta">
                        <span className="mrd-review-username">
                          {user?.username}
                        </span>
                        <span className="mrd-review-date">Your review</span>
                      </div>
                    </div>
                    <form onSubmit={handleSubmitReview}>
                      <StarPicker value={newRating} onChange={setNewRating} />
                      <textarea
                        className="mrd-review-textarea"
                        placeholder="Share your thoughts (optional)..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      {reviewError && (
                        <p className="mrd-review-error">{reviewError}</p>
                      )}
                      <button
                        className="mrd-review-submit"
                        type="submit"
                        disabled={submitting}
                      >
                        {submitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="mrd-review-item mrd-review-login-card">
                    <div className="mrd-review-header">
                      <div className="mrd-review-avatar">?</div>
                      <div className="mrd-review-meta">
                        <span className="mrd-review-username">Guest</span>
                        <span className="mrd-review-date">Your review</span>
                      </div>
                    </div>
                    <p className="mrd-review-login">
                      <button
                        className="mrd-review-login-btn"
                        onClick={() => navigate("/login")}
                      >
                        Log in
                      </button>{" "}
                      to leave a review.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default MyRecipeDetails;
