import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import RecipeCard from "components/recipe-card/UI_RecipeCard";
import "./UI_MealPlan.css";
import "pages/MainPage.css";

function UI_MealPlanModal({ isOpen, onClose }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [favourites, setFavourites] = useState([]);
  const [createdRecipes, setCreatedRecipes] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    async function fetchModalData() {
      setLoading(true);
      setError("");
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [favRes, createdRes] = await Promise.all([
          fetch("http://localhost:5001/api/favourites", { headers }),
          fetch("http://localhost:5001/api/user-recipes2", { headers }),
        ]);

        if (!favRes.ok || !createdRes.ok) {
          throw new Error("Failed to load recipes for meal plan modal.");
        }

        const favData = await favRes.json();
        const createdData = await createdRes.json();

        setFavourites(Array.isArray(favData) ? favData : []);
        setCreatedRecipes(Array.isArray(createdData) ? createdData : []);

        if (Array.isArray(favData) && favData.length > 0) {
          const ids = favData.map((f) => f.recipeId).join(",");
          const ratingRes = await fetch(
            `http://localhost:5001/api/reviews/bulk-ratings?ids=${ids}`,
          );
          if (ratingRes.ok) {
            setRatings(await ratingRes.json());
          } else {
            setRatings({});
          }
        } else {
          setRatings({});
        }
      } catch (err) {
        setError(err.message || "Unable to load recipe data.");
      } finally {
        setLoading(false);
      }
    }

    fetchModalData();
  }, [isOpen, token]);

  if (!isOpen) return null;

  const favouriteGroups = favourites.reduce((acc, fav) => {
    const key = fav.dishType
      ? fav.dishType.charAt(0).toUpperCase() + fav.dishType.slice(1)
      : "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(fav);
    return acc;
  }, {});

  return (
    <div className="mps-modal-overlay" onClick={onClose}>
      <div
        className="mps-modal-body"
        role="dialog"
        aria-modal="true"
        aria-label="Select recipes for meal plan"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mps-modal-header">
          <h2>Select Recipes</h2>
        </div>

        <div className="mps-modal-content">
          {loading && <p>Loading recipes...</p>}
          {error && <p className="mps-modal-error">{error}</p>}

          {!loading && !error && (
            <>
              <div className="mps-modal-sections">
                <h3>Favourite Recipes</h3>
                {favourites.length === 0 && (
                  <p className="mps-modal-empty">No favourites yet.</p>
                )}

                {Object.entries(favouriteGroups).map(([category, items]) => (
                  <div key={category} className="mps-modal-section">
                    <div className="mps-modal-section-header">
                      <span className="mps-modal-section-label">{category}</span>
                      <div className="mps-modal-section-line" />
                      <span className="mps-modal-section-count">
                        {items.length} saved
                      </span>
                    </div>
                    <div className="mps-modal-card-list">
                      {items.map((fav) => (
                        <div key={fav._id} className="mps-modal-card-wrapper">
                          <RecipeCard
                            title={fav.title}
                            image={fav.image}
                            cuisineType={fav.cuisineType}
                            dishType={fav.dishType}
                            readyInMinutes={fav.readyInMinutes}
                            difficulty={
                              fav.readyInMinutes <= 30
                                ? "Easy"
                                : fav.readyInMinutes <= 60
                                  ? "Medium"
                                  : "Hard"
                            }
                            isFavourited={true}
                            rating={ratings[fav.recipeId] ?? null}
                            onClick={() => navigate(`/recipe/${fav.recipeId}`)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mps-modal-sections">
                <h3>My Created Recipes</h3>
                {createdRecipes.length === 0 && (
                  <p className="mps-modal-empty">No created recipes yet.</p>
                )}

                {createdRecipes.length > 0 && (
                  <div className="mps-modal-section">
                    <div className="mps-modal-section-header">
                      <span className="mps-modal-section-label">Created By You</span>
                      <div className="mps-modal-section-line" />
                      <span className="mps-modal-section-count">
                        {createdRecipes.length} recipes
                      </span>
                    </div>
                    <div className="mps-modal-card-list">
                      {createdRecipes.map((recipe) => (
                        <div key={recipe._id} className="mps-modal-card-wrapper">
                          <RecipeCard
                            title={recipe.name}
                            image={recipe.image}
                            dishType={recipe.isPublic ? "Public" : "Private"}
                            hideHeart={true}
                            onClick={() => navigate(`/my-recipe/${recipe._id}`)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="mps-modal-actions">
          <button
            type="button"
            className="mps-modal-btn mps-modal-btn-save"
            onClick={onClose}
          >
            Save
          </button>
          <button
            type="button"
            className="mps-modal-btn mps-modal-btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default UI_MealPlanModal;
