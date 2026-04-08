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

// Parses the recipe's instructions field to extract data and steps
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

// Parses an ingredient string into amount and ingredient name
function parseIngredient(str) {
  const match = str.match(
    /^(\d[\d/.\s]*(?:cups?|tbsp?|tsp?|oz|lbs?|g|kg|ml|l|cloves?|pieces?|slices?|cans?|bunches?|handful|pinch|dash|to taste)?)\s+(.+)/i,
  );
  if (match) {
    return { amount: match[1].trim(), name: match[2].trim() };
  }
  return { amount: "—", name: str };
}

// Page for viewing details of a user's own recipe, including reviews
function MyRecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

              {/* Meta pills */}
              <div className="mrd-meta">
                {parsed.serves && (
                  <span className="mrd-chip highlight">
                    Serves {parsed.serves}
                  </span>
                )}
                {parsed.cookTime && (
                  <span className="mrd-chip highlight">
                    {parsed.cookTime} min
                  </span>
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
                    <p className="mrd-empty-text">
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

              {/* Reviews */}
              <RecipeReview
                recipeId={id}
                token={token}
                user={user}
                type="user-recipe"
              />
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default MyRecipeDetails;
