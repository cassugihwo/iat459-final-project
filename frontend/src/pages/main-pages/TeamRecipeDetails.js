import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import Navbar from "components/navbar/UI_Navbar";
import Footer from "components/footer/UI_Footer";
import Toast from "components/toast/UI_Toast";
import RecipeReview from "components/recipe-review/RecipeReview";
import { useAuth } from "context/AuthContext";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";
import "pages/page-css/MyRecipeDetail.css";

function parseIngredient(str) {
  const match = str.match(
    /^(\d[\d/.\s]*(?:cups?|tbsp?|tsp?|oz|lbs?|g|kg|ml|l|cloves?|pieces?|slices?|cans?|bunches?|handful|pinch|dash|to taste)?)\s+(.+)/i,
  );
  if (match) {
    return { amount: match[1].trim(), name: match[2].trim() };
  }
  return { amount: "—", name: str };
}

function TeamRecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const res = await fetch(`http://localhost:5001/api/team-recipes/${id}`);
        if (!res.ok) {
          const text = await res.text();
          let msg = "Failed to load recipe.";
          try {
            msg = JSON.parse(text).message || msg;
          } catch {}
          throw new Error(msg);
        }
        const data = await res.json();
        setRecipe(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipe();
  }, [id]);

  const ingredients = recipe
    ? (recipe.ingredients || "")
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean)
    : [];

  const steps = recipe
    ? (recipe.instructions || "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
    : [];

  const tags = recipe?.tags?.length
    ? recipe.tags
    : [recipe?.cuisineType, recipe?.dishType].filter(Boolean);

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

          {recipe && (
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

              {/* Meta pills */}
              <div className="mrd-meta">
                {recipe.readyInMinutes && (
                  <span className="mrd-chip highlight">
                    {recipe.readyInMinutes} min
                  </span>
                )}
                {recipe.difficulty && (
                  <span className="mrd-chip highlight">
                    {recipe.difficulty}
                  </span>
                )}
                {tags.map((tag, i) => (
                  <span key={i} className="mrd-chip">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Author + Date */}
              <div className="mrd-owner-row">
                <div className="mrd-owner-avatar mrd-owner-initials">YM</div>
                <div>
                  <p className="mrd-owner-name">YumMeal Team</p>
                  <p className="mrd-owner-date">Created {createdDate}</p>
                </div>
              </div>

              {/* Description */}
              {recipe.description && (
                <p
                  style={{
                    fontFamily: "Noto Sans, sans-serif",
                    fontSize: "0.95rem",
                    color: "#555",
                    lineHeight: "1.6",
                    margin: "0 0 1.5rem",
                  }}
                >
                  {recipe.description}
                </p>
              )}

              <div className="mrd-body">
                {/* Ingredients */}
                <div className="mrd-ingredients-section">
                  <h2 className="mrd-section-title">Ingredients</h2>
                  {ingredients.length === 0 ? (
                    <p
                      style={{
                        color: "#888",
                        fontFamily: "Noto Sans, sans-serif",
                      }}
                    >
                      No ingredients listed.
                    </p>
                  ) : (
                    <div className="mrd-ingredients-columns">
                      <div className="mrd-ingredients-col">
                        <p className="mrd-col-label">Item</p>
                        <ul className="mrd-ingredients">
                          {ingredients.map((ing, i) => (
                            <li key={i} className="mrd-ingredient-name">
                              <span>{parseIngredient(ing).name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mrd-ingredients-col">
                        <p className="mrd-col-label">Amount</p>
                        <ul className="mrd-ingredients">
                          {ingredients.map((ing, i) => (
                            <li key={i} className="mrd-ingredient-amount">
                              {parseIngredient(ing).amount}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="mrd-instructions-section">
                  <h2 className="mrd-section-title">Instructions</h2>
                  {steps.length === 0 ? (
                    <p
                      style={{
                        color: "#888",
                        fontFamily: "Noto Sans, sans-serif",
                      }}
                    >
                      No instructions available.
                    </p>
                  ) : (
                    <div className="mrd-steps">
                      {steps.map((step, i) => (
                        <div key={i} className="mrd-step">
                          <span className="mrd-step-number">{i + 1}</span>
                          <p className="mrd-step-text">{step}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews */}
              <RecipeReview
                recipeId={id}
                token={token}
                user={user}
                type="team-recipe"
              />
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default TeamRecipeDetails;
