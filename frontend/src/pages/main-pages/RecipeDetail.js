import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Toast from "components/toast/UI_Toast";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import Navbar from "components/navbar/UI_Navbar";
import Footer from "components/footer/UI_Footer";
import { useAuth } from "context/AuthContext";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";
import Icon_heart_empty from "assets/icons/icon-heart-empty-red.svg";
import Icon_heart_filled from "assets/icons/icon-heart-filled-red.svg";
import "pages/page-css/RecipeDetail.css";

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
        <span key={n} className={n <= rating ? "star-filled" : "star-empty"}>★</span>
      ))}
    </span>
  );
}

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavourited, setIsFavourited] = useState(false);

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
    async function fetchDetail() {
      try {
        const res = await fetch(`http://localhost:5001/api/recipes/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load recipe.");
        setRecipe(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`http://localhost:5001/api/reviews/${id}`);
        if (!res.ok) return;
        const data = await res.json();
        setReviews(data);
        if (data.length) {
          setAvgRating(
            parseFloat((data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(1))
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
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.avatar) setUserAvatar(data.avatar); })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    async function checkFavourite() {
      try {
        const res = await fetch("http://localhost:5001/api/favourites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setIsFavourited(data.some((f) => String(f.recipeId) === String(id)));
      } catch (err) {}
    }
    checkFavourite();
  }, [token, id]);

  async function handleToggleFavourite() {
    if (!token) return navigate("/login");
    try {
      const res = await fetch("http://localhost:5001/api/favourites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          recipeId: recipe.id,
          title: recipe.title,
          image: recipe.image,
          cuisineType: recipe.cuisines?.[0] || "",
          dishType: recipe.dishTypes?.[0] || "",
          readyInMinutes: recipe.readyInMinutes,
        }),
      });
      const data = await res.json();
      setIsFavourited(data.saved);
    } catch (err) {}
  }

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!newRating) { setReviewError("Please select a star rating."); return; }
    setSubmitting(true);
    setReviewError("");
    try {
      const res = await fetch(`http://localhost:5001/api/reviews/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: newRating, comment: newComment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review.");
      const updated = [data, ...reviews];
      setReviews(updated);
      setAvgRating(
        parseFloat((updated.reduce((s, r) => s + r.rating, 0) / updated.length).toFixed(1))
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
          ? parseFloat((updated.reduce((s, r) => s + r.rating, 0) / updated.length).toFixed(1))
          : 0
      );
    } catch (err) {}
  }

  const difficulty =
    recipe?.readyInMinutes <= 30 ? "Easy"
    : recipe?.readyInMinutes <= 60 ? "Medium"
    : "Hard";

  return (
    <div className="home-page">
      <div className="navbarHeader">
        <NavbarHeader />
      </div>

      <div className="bg">
        <div className="bg-food bg-food-left"><img src={leftDish} alt="Decorative dish" /></div>
        <div className="bg-food bg-food-center"><img src={centerDish} alt="Decorative dish" /></div>
        <div className="bg-food bg-food-right"><img src={rightDish} alt="Decorative dish" /></div>
        <div className="bg-logo"><img src={logo} alt="YumMeal Logo" /></div>
        <div className="bg-gradient"></div>
      </div>

      <div className="main">
        <div className="navbar"><Navbar /></div>

        <div className="main-content">
          <div className="rd-back-bar">
            <button className="rd-back-btn" onClick={() => navigate(-1)}>
              <span className="rd-back-arrow">←</span> Back
            </button>
          </div>

          {loading && <p className="rd-loading">Loading recipe...</p>}
          <Toast message={error} onClose={() => setError("")} />

          {recipe && (
            <>
              <div className="rd-content">
                <div className="rd-hero">
                  <img src={recipe.image} alt={recipe.title} />
                  <button
                    className={`rd-fav-btn${isFavourited ? " favourited" : ""}`}
                    onClick={handleToggleFavourite}
                    aria-label="Save as favourite"
                  >
                    <img src={isFavourited ? Icon_heart_filled : Icon_heart_empty} alt="Favourite" />
                  </button>
                </div>

                <h1 className="rd-title">{recipe.title}</h1>

                <div className="rd-meta">
                  <span className="rd-chip highlight">{recipe.readyInMinutes} min</span>
                  <span className="rd-chip highlight">{difficulty}</span>
                  <span className="rd-chip highlight">Serves {recipe.servings}</span>
                  {recipe.cuisines[0] && <span className="rd-chip highlight">{recipe.cuisines[0]}</span>}
                  {recipe.dishTypes[0] && <span className="rd-chip highlight">{recipe.dishTypes[0]}</span>}
                  {recipe.diets[0] && <span className="rd-chip highlight">{recipe.diets[0]}</span>}
                </div>

                <div className="rd-body">
                  {/* Ingredients */}
                  <div className="rd-ingredients-section">
                    <h2 className="rd-section-title">Ingredients</h2>
                    <div className="rd-ingredients-columns">
                      <div className="rd-ingredients-col">
                        <p className="rd-col-label">Item</p>
                        <ul className="rd-ingredients">
                          {recipe.ingredients.map((ing) => (
                            <li key={ing.id} className="rd-ingredient-name">
                              <span>{ing.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rd-ingredients-col">
                        <p className="rd-col-label">Amount</p>
                        <ul className="rd-ingredients">
                          {recipe.ingredients.map((ing) => (
                            <li key={ing.id} className="rd-ingredient-amount">
                              {[ing.amount, ing.unit].filter(Boolean).join(" ") || "—"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="rd-instructions-section">
                    <h2 className="rd-section-title">Instructions</h2>
                    {recipe.steps.length === 0 ? (
                      <p style={{ color: "#888", fontFamily: "Noto Sans, sans-serif" }}>
                        No instructions available.
                      </p>
                    ) : (
                      <div className="rd-steps">
                        {recipe.steps.map((s) => (
                          <div key={s.number} className="rd-step">
                            <span className="rd-step-number">{s.number}</span>
                            <p className="rd-step-text">{s.step}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reviews section */}
                <div className="rd-reviews-section">
                  <h2 className="rd-section-title">Rating</h2>

                  {/* Summary card — always shown */}
                  <div className="rd-rating-summary">
                    <div className="rd-rating-summary-left">
                      <span className="rd-rating-big">{reviews.length > 0 ? avgRating : "0"}</span>
                      <ReviewStars rating={reviews.length > 0 ? Math.round(avgRating) : 0} />
                      <span className="rd-review-count">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="rd-rating-bars">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.filter((r) => r.rating === star).length;
                        const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                        return (
                          <div key={star} className="rd-rating-bar-row">
                            <span className="rd-bar-label">{star}</span>
                            <div className="rd-bar-track">
                              <div className="rd-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="rd-bar-pct">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review list */}
                  <h2 className="rd-section-title" style={{ marginTop: "2rem" }}>Reviews</h2>

                  {reviews.length === 0 ? (
                    <p className="rd-no-reviews">No reviews yet. Be the first!</p>
                  ) : (
                    <>
                      <div className="rd-review-list">
                        {(reviewsExpanded ? reviews : reviews.slice(0, REVIEWS_PREVIEW)).map((r) => {
                          const initials = r.username.slice(0, 2).toUpperCase();
                          const avatar = r.owner?.avatar;
                          return (
                            <div key={r._id} className="rd-review-item">
                              <div className="rd-review-header">
                                <div className="rd-review-avatar">
                                  {avatar
                                    ? <img src={avatar} alt={r.username} className="rd-review-avatar-img" />
                                    : initials}
                                </div>
                                <div className="rd-review-meta">
                                  <span className="rd-review-username">{r.username}</span>
                                  <span className="rd-review-date">
                                    {new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                                  </span>
                                </div>
                                {user?.username === r.username && (
                                  <button
                                    className="rd-review-delete"
                                    onClick={() => handleDeleteReview(r._id)}
                                    aria-label="Delete review"
                                  >×</button>
                                )}
                              </div>
                              <ReviewStars rating={r.rating} />
                              {r.comment && <p className="rd-review-comment">{r.comment}</p>}
                            </div>
                          );
                        })}
                      </div>
                      {reviews.length > REVIEWS_PREVIEW && (
                        <button
                          className="rd-reviews-toggle"
                          onClick={() => setReviewsExpanded((prev) => !prev)}
                        >
                          {reviewsExpanded
                            ? "Show less ▲"
                            : `Show all ${reviews.length} reviews ▼`}
                        </button>
                      )}
                    </>
                  )}

                  {/* Review form — styled like a review card */}
                  {token ? (
                    <div className="rd-review-item rd-review-form-card">
                      <div className="rd-review-header">
                        <div className="rd-review-avatar">
                          {userAvatar
                            ? <img src={userAvatar} alt={user?.username} className="rd-review-avatar-img" />
                            : user?.username?.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="rd-review-meta">
                          <span className="rd-review-username">{user?.username}</span>
                          <span className="rd-review-date">Your review</span>
                        </div>
                      </div>
                      <form onSubmit={handleSubmitReview}>
                        <StarPicker value={newRating} onChange={setNewRating} />
                        <textarea
                          className="rd-review-textarea"
                          placeholder="Share your thoughts (optional)..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                        />
                        {reviewError && <p className="rd-review-error">{reviewError}</p>}
                        <button className="rd-review-submit" type="submit" disabled={submitting}>
                          {submitting ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="rd-review-item rd-review-login-card">
                      <div className="rd-review-header">
                        <div className="rd-review-avatar">?</div>
                        <div className="rd-review-meta">
                          <span className="rd-review-username">Guest</span>
                          <span className="rd-review-date">Your review</span>
                        </div>
                      </div>
                      <p className="rd-review-login">
                        <button className="rd-review-login-btn" onClick={() => navigate("/login")}>Log in</button>{" "}
                        to leave a review.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default RecipeDetail;
