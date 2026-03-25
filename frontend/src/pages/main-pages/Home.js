import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";
import "pages/css/RecipeCard.css";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    async function fetchHomeRecipes() {
      try {
        const response = await fetch("http://localhost:5001/api/home-recipes");

        const contentType = response.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Expected JSON but got:", text);
          throw new Error("Backend did not return JSON.");
        }

        const data = await response.json();

        if (!response.ok) {
          console.error("Backend error:", data);
          throw new Error(data.error || "Failed to fetch recipes.");
        }

        setRecipes(data);
      } catch (err) {
        console.error("Fetch home recipes error:", err);
        setError(err.message || "Could not load recipes.");
      } finally {
        setLoading(false);
      }
    }

    fetchHomeRecipes();
  }, []);

  function handleSaveFavourite(recipe) {
    if (!user) {
      navigate("/member-only", {
        state: { featureName: "Save as Favourite" },
      });
      return;
    }

    console.log("Save favourite:", recipe);
  }

  const filterOptions = useMemo(() => {
    const types = recipes
      .map((recipe) => recipe.dishType)
      .filter(Boolean)
      .map((type) => type.trim());

    const uniqueTypes = [...new Set(types)];

    return ["All", ...uniqueTypes];
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    if (selectedType === "All") return recipes;

    return recipes.filter(
      (recipe) =>
        recipe.dishType &&
        recipe.dishType.toLowerCase() === selectedType.toLowerCase()
    );
  }, [recipes, selectedType]);

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
          <div className="header-container">
            <div className="header-container-wrapper">
              <h1>
                Welcome {user?.username ? `back, ${user.username}` : "to YumMeal"}!
              </h1>
            </div>
          </div>

          <section className="home-recipes-section">
            <h2>Recipes of the Week</h2>
            <p>Recommended recipes from the YumMeal team!</p>

            <div className="recipe-filter-section">
              <div className="recipe-filter-title">Type</div>

              <div className="recipe-filter-pills">
                {filterOptions.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`recipe-filter-pill ${selectedType === type ? "active" : ""}`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {loading && <p>Loading recipes...</p>}
            {error && <p>{error}</p>}

            {!loading && !error && filteredRecipes.length === 0 && (
              <p>No recipes found for this type.</p>
            )}

            <div className="recipe-grid">
              {filteredRecipes.map((recipe) => (
                <div className="recipe-card" key={recipe.id}>
                  <div className="recipe-card-image-wrap">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="recipe-card-image"
                    />
                  </div>

                  <div className="recipe-card-body">
                    <p className="recipe-meta">
                      {recipe.cuisineType}, {recipe.dishType}
                    </p>

                    <h3>{recipe.title}</h3>

                    <p className="recipe-time">⏱ {recipe.readyInMinutes} min</p>

                    <div className="recipe-card-buttons">
                      <button onClick={() => navigate(`/recipe/${recipe.id}`)}>
                        View Recipe Details
                      </button>

                      <button onClick={() => handleSaveFavourite(recipe)}>
                        Save as Favourite
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Home;
