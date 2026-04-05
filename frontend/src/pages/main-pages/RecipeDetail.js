import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavourited, setIsFavourited] = useState(false);

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
    if (!token) return navigate("/member-only", { state: { featureName: "Favourite Recipes" } });
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
                          {recipe.ingredients.map((ing) => (
                            <li key={ing.id} className="rd-ingredient-name">{ing.name}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rd-ingredients-col">
                        <h2 className="rd-section-title">Amount</h2>
                        <ul className="rd-ingredients">
                          {recipe.ingredients.map((ing) => (
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
