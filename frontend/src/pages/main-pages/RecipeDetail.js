import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import Navbar from "components/navbar/UI_Navbar";
import Footer from "components/footer/UI_Footer";
import "pages/page-css/RecipeDetail.css";

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const difficulty =
    recipe?.readyInMinutes <= 30
      ? "Easy"
      : recipe?.readyInMinutes <= 60
      ? "Medium"
      : "Hard";

  return (
    <div className="rd-page">
      <NavbarHeader />

      <div className="main">
        <div className="navbar">
          <Navbar />
        </div>

        <div className="rd-back-bar">
          <button className="rd-back-btn" onClick={() => navigate(-1)}>
            <span className="rd-back-arrow">←</span> Back
          </button>
        </div>

        {loading && <p className="rd-loading">Loading recipe...</p>}
        {error && <p className="rd-error">{error}</p>}

        {recipe && (
          <>
            <div className="rd-hero">
              <img src={recipe.image} alt={recipe.title} />
            </div>

            <div className="rd-content">
              <h1 className="rd-title">{recipe.title}</h1>

              <div className="rd-meta">
                <span className="rd-chip highlight">⏱ {recipe.readyInMinutes} min</span>
                <span className="rd-chip highlight">{difficulty}</span>
                <span className="rd-chip highlight">🍽 Serves {recipe.servings}</span>
                {recipe.cuisines[0] && (
                  <span className="rd-chip highlight">{recipe.cuisines[0]}</span>
                )}
                {recipe.dishTypes[0] && (
                  <span className="rd-chip highlight">{recipe.dishTypes[0]}</span>
                )}
                {recipe.diets[0] && (
                  <span className="rd-chip highlight">{recipe.diets[0]}</span>
                )}
              </div>

              <div className="rd-body">
                <div className="rd-ingredients-section">
                  <h2 className="rd-section-title">Ingredients</h2>
                  <ul className="rd-ingredients">
                    {recipe.ingredients.map((ing) => (
                      <li key={ing.id} className="rd-ingredient">
                        {ing.original}
                      </li>
                    ))}
                  </ul>
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
            </div>
          </>
        )}

        <Footer />
      </div>
    </div>
  );
}

export default RecipeDetail;
