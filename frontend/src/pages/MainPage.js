import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import Footer from "components/footer/UI_Footer";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";
import "pages/MainPage.css";

function Home() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedRecipeIds, setSavedRecipeIds] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/api/user-recipes2/")
      .then((res) => res.json())
      .then((data) => setRecipes(data))
      .catch((err) => console.error("Error fetching recipes:", err));
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const name = recipe.name?.toLowerCase() || "";
      const ingredients = recipe.ingredients?.toLowerCase() || "";
      const query = searchTerm.toLowerCase();
      return name.includes(query) || ingredients.includes(query);
    });
  }, [recipes, searchTerm]);

  const recipesOfWeek = filteredRecipes.slice(0, 6);

  function toggleSaveRecipe(id) {
    if (!user) {
      navigate("/login");
      return;
    }

    setSavedRecipeIds((prev) =>
      prev.includes(id)
        ? prev.filter((recipeId) => recipeId !== id)
        : [...prev, id],
    );
  }

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
          <p className="bg-tagline">Find your next Yum!</p>
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
              <h1>{user ? `Welcome, ${user.username}` : "Welcome"}</h1>
              <p className="home-subtext">
                {user
                  ? "Browse recipes, save favourites, and build your YumMeal collection."
                  : "Browse recipes as a visitor. Log in to save favourites and add your own recipes."}
              </p>
            </div>
          </div>

          <div className="home-toolbar">
            <input
              className="recipe-search"
              type="text"
              placeholder="Search recipes by name or ingredient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {user ? (
              <button className="toolbar-btn" onClick={handleLogout}>
                Logout
              </button>
            ) : (
              <button
                className="toolbar-btn"
                onClick={() => navigate("/login")}
              >
                Log In
              </button>
            )}
          </div>

          <section className="recipe-section">
            <h2>Recipes of The Week</h2>
            <p>Recommended recipes from the YumMeal team!</p>

            <div className="recipe-grid">
              {recipesOfWeek.map((recipe) => (
                <div key={recipe._id} className="home-recipe-card">
                  <div className="home-recipe-image">
                    <img src={leftDish} alt={recipe.name} />
                    <button
                      className={`save-btn ${savedRecipeIds.includes(recipe._id) ? "saved" : ""}`}
                      onClick={() => toggleSaveRecipe(recipe._id)}
                    >
                      ♡
                    </button>
                  </div>

                  <div className="home-recipe-body">
                    <p className="recipe-meta">Main Dish • Easy</p>
                    <h3>{recipe.name}</h3>
                    <p className="recipe-small">⏱ 20 min</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Home;
