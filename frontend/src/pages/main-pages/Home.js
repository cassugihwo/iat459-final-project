import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import RecipeCard from "components/recipe-card/UI_RecipeCard";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";
import Footer from "components/footer/UI_Footer";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favouriteIds, setFavouriteIds] = useState(new Set());

  const { token } = useAuth();

  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    if (!token) return;
    async function fetchFavourites() {
      try {
        const res = await fetch("http://localhost:5001/api/favourites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setFavouriteIds(new Set(data.map((f) => f.recipeId)));
      } catch (err) {
        console.error("Fetch favourites error:", err);
      }
    }
    fetchFavourites();
  }, [token]);

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

  async function handleSaveFavourite(recipe) {
    if (!user) {
      navigate("/member-only", {
        state: { featureName: "Save as Favourite" },
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/favourites/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipeId: recipe.id,
          title: recipe.title,
          image: recipe.image,
          cuisineType: recipe.cuisineType,
          dishType: recipe.dishType,
          readyInMinutes: recipe.readyInMinutes,
        }),
      });
      const data = await res.json();
      setFavouriteIds((prev) => {
        const next = new Set(prev);
        if (data.saved) {
          next.add(recipe.id);
        } else {
          next.delete(recipe.id);
        }
        return next;
      });
    } catch (err) {
      console.error("Toggle favourite error:", err);
    }
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
              <h2>
                Welcome {user?.username ? `back, ${user.username}` : "to YumMeal"}!
              </h2>
            </div>
          </div>

          <section className="home-recipes-section">
            <h3>Recipes of the Week</h3>
            <p>Recommended recipes from the YumMeal team!</p>

            <div className="recipe-filter-section">
              <div className="recipe-filter-title">Dish Type</div>

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

            {/* {loading && <p>Loading recipes...</p>}
            {error && <p>{error}</p>} */}

            {!loading && !error && filteredRecipes.length === 0 && (
              <p>No recipes found for this type.</p>
            )}

            <div className="recipe-carousel-wrapper">
              <div className="recipe-carousel" ref={carouselRef}>
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    title={recipe.title}
                    image={recipe.image}
                    cuisineType={recipe.cuisineType}
                    dishType={recipe.dishType}
                    readyInMinutes={recipe.readyInMinutes}
                    difficulty={
                      recipe.readyInMinutes <= 30 ? "Easy"
                      : recipe.readyInMinutes <= 60 ? "Medium"
                      : "Hard"
                    }
                    isFavourited={favouriteIds.has(recipe.id)}
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                    onFavourite={() => handleSaveFavourite(recipe)}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Home;
