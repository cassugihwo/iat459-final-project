import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import Navbar from "components/navbar/UI_Navbar";
import Footer from "components/footer/UI_Footer";
import ScrollToTop from "components/scroll-to-top/UI_ScrollToTop";
import { useAuth } from "context/AuthContext";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";
import Icon_heart_empty from "assets/icons/icon-heart-empty-red.svg";
import Icon_heart_filled from "assets/icons/icon-heart-filled-red.svg";
import Toast from "components/toast/UI_Toast";
import "pages/page-css/RecipeDetail.css";

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="rd-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`rd-star${(hovered || value) >= star ? " active" : ""}`}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
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

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [reviewSort, setReviewSort] = useState("all");

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`http://localhost:5001/api/recipes/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load recipe.");
        setRecipe(data);
        console.log("Fetched recipe detail:");
        console.log(data);
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
        const data = await res.json();
        setReviews(data);
      } catch (err) {}
    }
    fetchReviews();
  }, [id]);

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
    if (!token) { navigate("/login"); return; }
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
    if (!myRating) { setReviewError("Please select a star rating."); return; }
    setReviewError("");
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5001/api/reviews/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating: myRating, comment: myComment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setReviewError(data.message || "Failed to submit."); return; }
      setMyRating(0);
      setMyComment("");
      setReviews((prev) => [data, ...prev]);
    } catch (err) {
      setReviewError("Something went wrong.");
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
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {}
  }

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
    return { star, count, pct };
  });

  const NON_INGREDIENT = /^(to serve|for serving|to taste|for garnish|garnish|for the sauce|for sauce|for topping|to finish|optional|as needed)\b/i;

  const uniqueIngredients = recipe
    ? recipe.ingredients
        .filter((ing, idx, arr) =>
          arr.findIndex((x) => x.name.toLowerCase() === ing.name.toLowerCase()) === idx
        )
        .filter((ing) => !NON_INGREDIENT.test(ing.name.trim()))
    : [];

  const difficulty =
    recipe?.readyInMinutes <= 30
      ? "Easy"
      : recipe?.readyInMinutes <= 60
      ? "Medium"
      : "Hard";

  return (
    <div className="home-page">
      <div className="navbarHeader">
        <NavbarHeader />
      </div>

      <div className="bg">
        <div className="bg-food bg-food-left">
          <img src={leftDish} alt="Decorative dish" />
        </div>
        <div className="bg-food bg-food-center">
          <img src={centerDish} alt="Decorative dish" />
        </div>
        <div className="bg-food bg-food-right">
          <img src={rightDish} alt="Decorative dish" />
        </div>
        <div className="bg-logo">
          <img src={logo} alt="YumMeal Logo" />
        </div>
        <div className="bg-gradient"></div>
      </div>

      <Toast message={reviewError} onClose={() => setReviewError("")} />
      <div className="main">
        <div className="navbar">
          <Navbar />
        </div>

        <div className="main-content">
          <div className="rd-back-bar">
            <button className="rd-back-btn" onClick={() => navigate(-1)}>
              <span className="rd-back-arrow">←</span> Back
            </button>
          </div>

          {loading && <p className="rd-loading">Loading recipe...</p>}
          {error && <p className="rd-error">{error}</p>}

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
                    <img
                      src={isFavourited ? Icon_heart_filled : Icon_heart_empty}
                      alt="Favourite"
                    />
                  </button>
                </div>

                <h1 className="rd-title">{recipe.title}</h1>

                <div className="rd-meta">
                  <span className="rd-chip highlight">
                    ⏱ {recipe.readyInMinutes} min
                  </span>
                  <span className="rd-chip highlight">{difficulty}</span>
                  <span className="rd-chip highlight">
                    🍽 Serves {recipe.servings}
                  </span>
                  {recipe.cuisines[0] && (
                    <span className="rd-chip highlight">
                      {recipe.cuisines[0]}
                    </span>
                  )}
                  {recipe.dishTypes[0] && (
                    <span className="rd-chip highlight">
                      {recipe.dishTypes[0]}
                    </span>
                  )}
                  {recipe.diets[0] && (
                    <span className="rd-chip highlight">{recipe.diets[0]}</span>
                  )}
                </div>

                <div className="rd-body">
                  {/* Ingredients section (original) */}
                  {/* <div className="rd-ingredients-section">
                    <div className="rd-ingredients-columns">
                      <div className="rd-ingredients-col">
                        <h2 className="rd-section-title">Ingredients</h2>
                        <ul className="rd-ingredients">
                          {uniqueIngredients.map((ing) => (
                            <li key={ing.id} className="rd-ingredient-name">{ing.name}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rd-ingredients-col">
                        <h2 className="rd-section-title">Amount</h2>
                        <ul className="rd-ingredients">
                          {uniqueIngredients.map((ing) => (
                            <li key={ing.id} className="rd-ingredient-amount">{ing.original}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div> */}

                  {/* Ingredients new */}
                  <div className="rd-ingredients-section">
                      <div className="rd-ingredients-col">
                        <h2 className="rd-section-title">Ingredients</h2>
                        <ul className="rd-ingredients">
                          {recipe.ingredients.map((ing) => (
                            <li key={ing.id} className="rd-ingredient-name">
                              {`${ing.amount} ${ing.unit} `}<span>{ing.name}</span>
                              
                            </li>
                          ))}
                        </ul>
                      </div>
                  </div>

                  <div className="rd-instructions-section">
                    <h2 className="rd-section-title">Instructions</h2>
                    {recipe.steps.length === 0 ? (
                      <p
                        style={{
                          color: "#888",
                          fontFamily: "Noto Sans, sans-serif",
                        }}
                      >
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
                  <h2 className="rd-section-title">Ratings</h2>

                  {reviews.length > 0 && (
                    <div className="rd-rating-summary">
                      <div className="rd-rating-left">
                        <span className="rd-rating-avg">{avgRating}</span>
                        <div className="rd-rating-stars-display">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className={`rd-rating-star-icon${parseFloat(avgRating) >= s ? " active" : ""}`}>★</span>
                          ))}
                        </div>
                        <span className="rd-rating-count">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="rd-rating-bars">
                        {ratingBreakdown.map(({ star, pct }) => (
                          <div key={star} className="rd-rating-bar-row">
                            <span className="rd-bar-label">{star}</span>
                            <div className="rd-bar-track">
                              <div className="rd-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="rd-bar-pct">{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sort controls */}
                  {reviews.length > 0 && (
                    <div className="rd-review-sort">
                      {["all", "highest", "lowest"].map((opt) => (
                        <button
                          key={opt}
                          className={`rd-sort-pill${reviewSort === opt ? " active" : ""}`}
                          onClick={() => { setReviewSort(opt); setVisibleCount(5); }}
                        >
                          {opt === "all" ? "All" : opt === "highest" ? "Highest" : "Lowest"}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* All reviews list */}
                  {reviews.length === 0 ? (
                    <p className="rd-no-reviews">No reviews yet. Be the first!</p>
                  ) : (
                    <>
                      <div className="rd-reviews-list">
                        {[...reviews]
                          .sort((a, b) => reviewSort === "highest" ? b.rating - a.rating : reviewSort === "lowest" ? a.rating - b.rating : 0)
                          .slice(0, visibleCount)
                          .map((r) => (
                            <div key={r._id} className="rd-review-card">
                              <div className="rd-review-top">
                                <span className="rd-reviewer">{r.username}</span>
                                <StarRating value={r.rating} readonly />
                              </div>
                              <p className="rd-review-comment">{r.comment}</p>
                              <div className="rd-review-bottom">
                                <p className="rd-review-date">
                                  {new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                </p>
                                {user && r.username === user.username && (
                                  <button className="rd-review-delete" onClick={() => handleDeleteReview(r._id)}>Delete</button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                      {reviews.length > 5 && (
                        <button
                          className="rd-expand-btn"
                          onClick={() => setVisibleCount(visibleCount >= reviews.length ? 5 : reviews.length)}
                        >
                          {visibleCount >= reviews.length ? "Show less ↑" : "Show more ↓"}
                        </button>
                      )}
                    </>
                  )}

                  {/* Form for logged-in users */}
                  {token ? (
                    <form className="rd-review-form" onSubmit={handleSubmitReview}>
                      <p className="rd-form-label">Leave a review</p>
                      <StarRating value={myRating} onChange={setMyRating} />
                      <textarea
                        className="rd-review-textarea"
                        placeholder="Write your comment..."
                        value={myComment}
                        onChange={(e) => setMyComment(e.target.value)}
                        rows={3}
                      />
                      <div className="rd-form-btns">
                        <button type="submit" className="rd-review-submit" disabled={submitting}>
                          {submitting ? "Submitting..." : "Submit"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="rd-review-guest-banner">
                      <span>Want to share your thoughts?</span>
                      <button className="rd-review-guest-login" onClick={() => navigate("/login")}>Login to leave a review</button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
}

export default RecipeDetail;
