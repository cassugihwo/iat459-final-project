import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import RecipeCard from "components/recipe-card/UI_RecipeCard";
import Footer from "components/footer/UI_Footer";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";
import "pages/page-css/FavouriteRecipes.css";

function Pantry() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavourites() {
      try {
        const res = await fetch("http://localhost:5001/api/favourites", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setFavourites(data);
      } catch (err) {
        console.error("Fetch favourites error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFavourites();
  }, [token]);

  async function handleRemove(recipeId) {
    try {
      await fetch("http://localhost:5001/api/favourites/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipeId }),
      });
      setFavourites((prev) => prev.filter((f) => f.recipeId !== recipeId));
    } catch (err) {
      console.error("Remove favourite error:", err);
    }
  }

  const grouped = favourites.reduce((acc, fav) => {
    const key = fav.dishType ? fav.dishType.charAt(0).toUpperCase() + fav.dishType.slice(1) : "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(fav);
    return acc;
  }, {});

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
              <h2>My Favourite Recipes</h2>
            </div>
          </div>

          {loading && <p>Loading...</p>}

          {!loading && favourites.length === 0 && (
            <p className="fr-empty">
              No favourites yet. Click the heart on a recipe to save it here!
            </p>
          )}

          {!loading && favourites.length > 0 && (
            <div className="fr-sections">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="fr-section">
                  <div className="fr-section-header">
                    <span className="fr-section-label">{category}</span>
                    <div className="fr-section-line" />
                    <span className="fr-section-count">{items.length} saved</span>
                  </div>
                  <div className="fr-list">
                    {items.map((fav) => (
                      <div key={fav._id} className="fr-card-wrapper">
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
                          onFavourite={() => handleRemove(fav.recipeId)}
                          onClick={() => navigate(`/recipe/${fav.recipeId}`)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Pantry;
