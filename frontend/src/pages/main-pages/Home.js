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
import "pages/page-css/Home.css";

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

function getWeekOfYear() {
  return Math.floor(getDayOfYear() / 7);
}

function Home() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const teamCarouselRef = useRef(null);

  const [recipes, setRecipes] = useState([]);
  const [communityRecipes, setCommunityRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [userFavourites, setUserFavourites] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [dayType, setDayType] = useState("All");
  const [weekType, setWeekType] = useState("All");
  const [topType, setTopType] = useState("All");
  const [communityType, setCommunityType] = useState("All");
  const [favType, setFavType] = useState("All");
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5001/api/favourites", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setFavouriteIds(new Set(data.map((f) => f.recipeId)));
        setUserFavourites(data);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [homeRes, communityRes] = await Promise.all([
          fetch("http://localhost:5001/api/home-recipes"),
          fetch("http://localhost:5001/api/user-recipes2/public"),
        ]);
        const homeData = homeRes.ok ? await homeRes.json() : [];
        const communityData = communityRes.ok ? await communityRes.json() : [];
        setRecipes(homeData);
        setCommunityRecipes(communityData);
        if (homeData.length) {
          const ids = homeData.map((r) => r.id).join(",");
          const rRes = await fetch(
            `http://localhost:5001/api/reviews/bulk-ratings?ids=${ids}`,
          );
          if (rRes.ok) setRatings(await rRes.json());
        }
      } catch (err) {
        console.error("Home fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  async function handleSaveFavourite(recipe) {
    if (!user) {
      navigate("/member-only", { state: { featureName: "Save as Favourite" } });
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
        data.saved ? next.add(recipe.id) : next.delete(recipe.id);
        return next;
      });
    } catch (err) {
      console.error("Toggle favourite error:", err);
    }
  }

  const DAY_COUNT = 3;
  const WEEK_COUNT = 5;

  function getRotatingSlice(pool, seed, count) {
    if (!pool.length) return [];
    const start = seed % pool.length;
    const result = [];
    for (let i = 0; i < count && i < pool.length; i++) {
      result.push(pool[(start + i) % pool.length]);
    }
    return result;
  }

  const dayRecipes = useMemo(
    () => getRotatingSlice(recipes, getDayOfYear() * 3, DAY_COUNT),
    [recipes],
  );

  const weekRecipes = useMemo(() => {
    const dayStart = (getDayOfYear() * 3) % (recipes.length || 1);
    const weekStart = (getWeekOfYear() * 5 + DAY_COUNT) % (recipes.length || 1);
    if (weekStart === dayStart)
      return getRotatingSlice(recipes, weekStart + DAY_COUNT, WEEK_COUNT);
    return getRotatingSlice(recipes, weekStart, WEEK_COUNT);
  }, [recipes]);

  const filterOptions = useMemo(() => {
    const types = [
      ...new Set(
        recipes
          .map((r) => r.dishType)
          .filter(Boolean)
          .map((t) => t.trim()),
      ),
    ];
    return ["All", ...types];
  }, [recipes]);

  const filteredTeamRecipes = useMemo(() => {
    if (selectedType === "All") return recipes;
    return recipes.filter(
      (r) => r.dishType?.toLowerCase() === selectedType.toLowerCase(),
    );
  }, [recipes, selectedType]);

  const topRatedRecipes = useMemo(() => {
    return [...recipes]
      .filter((r) => (ratings[r.id] || 0) > 0)
      .sort((a, b) => (ratings[b.id] || 0) - (ratings[a.id] || 0))
      .slice(0, 5);
  }, [recipes, ratings]);

  const dayFilterOptions = useMemo(() => {
    const types = [
      ...new Set(
        dayRecipes
          .map((r) => r.dishType)
          .filter(Boolean)
          .map((t) => t.trim()),
      ),
    ];
    return ["All", ...types];
  }, [dayRecipes]);

  const filteredDayRecipes = useMemo(() => {
    if (dayType === "All") return dayRecipes;
    return dayRecipes.filter(
      (r) => r.dishType?.toLowerCase() === dayType.toLowerCase(),
    );
  }, [dayRecipes, dayType]);

  const weekFilterOptions = useMemo(() => {
    const types = [
      ...new Set(
        weekRecipes
          .map((r) => r.dishType)
          .filter(Boolean)
          .map((t) => t.trim()),
      ),
    ];
    return ["All", ...types];
  }, [weekRecipes]);

  const filteredWeekRecipes = useMemo(() => {
    if (weekType === "All") return weekRecipes;
    return weekRecipes.filter(
      (r) => r.dishType?.toLowerCase() === weekType.toLowerCase(),
    );
  }, [weekRecipes, weekType]);

  const topFilterOptions = useMemo(() => {
    const types = [
      ...new Set(
        topRatedRecipes
          .map((r) => r.dishType)
          .filter(Boolean)
          .map((t) => t.trim()),
      ),
    ];
    return ["All", ...types];
  }, [topRatedRecipes]);

  const filteredTopRecipes = useMemo(() => {
    if (topType === "All") return topRatedRecipes;
    return topRatedRecipes.filter(
      (r) => r.dishType?.toLowerCase() === topType.toLowerCase(),
    );
  }, [topRatedRecipes, topType]);

  const communityFilterOptions = useMemo(() => {
    const types = [
      ...new Set(
        communityRecipes
          .map((r) => {
            const m = r.instructions?.match(/Tags: ([^\n]+)/);
            return m ? m[1].split(",")[0]?.trim() : null;
          })
          .filter(Boolean),
      ),
    ];
    return ["All", ...types];
  }, [communityRecipes]);

  const filteredCommunityRecipes = useMemo(() => {
    if (communityType === "All") return communityRecipes;
    return communityRecipes.filter((r) => {
      const m = r.instructions?.match(/Tags: ([^\n]+)/);
      const first = m ? m[1].split(",")[0]?.trim() : null;
      return first?.toLowerCase() === communityType.toLowerCase();
    });
  }, [communityRecipes, communityType]);

  const favFilterOptions = useMemo(() => {
    const types = [
      ...new Set(
        userFavourites
          .map((f) => f.dishType)
          .filter(Boolean)
          .map((t) => t.trim()),
      ),
    ];
    return ["All", ...types];
  }, [userFavourites]);

  const filteredFavourites = useMemo(() => {
    if (favType === "All") return userFavourites;
    return userFavourites.filter(
      (f) => f.dishType?.toLowerCase() === favType.toLowerCase(),
    );
  }, [userFavourites, favType]);

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
          <div className="header-container">
            <div className="header-container-wrapper">
              <h2>
                Welcome{" "}
                {user?.username ? `back, ${user.username}` : "to YumMeal"}!
              </h2>
            </div>
          </div>

          {loading ? (
            <p className="home-loading">Loading recipes...</p>
          ) : (
            <>
              {/* Your Favourite Recipes(logged in users only) */}
              {user && (
                <section className="home-section">
                  <div className="home-section-header">
                    <div>
                      <h3 className="home-section-title">
                        Your Favourite Recipes
                      </h3>
                      <p className="home-section-sub">
                        Recipes you've saved as favourites
                      </p>
                    </div>
                  </div>
                  {userFavourites.length === 0 ? (
                    <p className="home-empty">
                      No favourites yet. Click the heart on any recipe to save
                      it!
                    </p>
                  ) : (
                    <>
                      <div className="recipe-filter-section">
                        <div className="recipe-filter-pills">
                          {favFilterOptions.map((type) => (
                            <button
                              key={type}
                              type="button"
                              className={`recipe-filter-pill${favType === type ? " active" : ""}`}
                              onClick={() => setFavType(type)}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="recipe-carousel-wrapper">
                        <div className="recipe-carousel">
                          {filteredFavourites.slice(0, 4).map((fav) => (
                            <RecipeCard
                              key={fav._id}
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
                              onClick={() =>
                                navigate(`/recipe/${fav.recipeId}`)
                              }
                              onFavourite={() =>
                                handleSaveFavourite({
                                  id: fav.recipeId,
                                  title: fav.title,
                                  image: fav.image,
                                  cuisineType: fav.cuisineType,
                                  dishType: fav.dishType,
                                  readyInMinutes: fav.readyInMinutes,
                                })
                              }
                            />
                          ))}
                          <div
                            className="home-fav-see-more-card"
                            onClick={() => navigate("/pantry")}
                          >
                            <span className="home-fav-see-more-arrow">→</span>
                            <span className="home-fav-see-more-label">
                              View All Favourites
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </section>
              )}

              {/* Recipe of the Day */}
              <section className="home-section">
                <div className="home-section-header">
                  <div>
                    <h3 className="home-section-title">Recipe of the Day</h3>
                    <p className="home-section-sub">
                      A new featured recipe every day
                    </p>
                  </div>
                </div>
                <div className="recipe-filter-section">
                  <div className="recipe-filter-pills">
                    {dayFilterOptions.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`recipe-filter-pill${dayType === type ? " active" : ""}`}
                        onClick={() => setDayType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="recipe-carousel-wrapper">
                  <div className="recipe-carousel">
                    {filteredDayRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        title={recipe.title}
                        image={recipe.image}
                        cuisineType={recipe.cuisineType}
                        dishType={recipe.dishType}
                        readyInMinutes={recipe.readyInMinutes}
                        difficulty={
                          recipe.readyInMinutes <= 30
                            ? "Easy"
                            : recipe.readyInMinutes <= 60
                              ? "Medium"
                              : "Hard"
                        }
                        isFavourited={favouriteIds.has(recipe.id)}
                        rating={ratings[recipe.id] ?? null}
                        onClick={() => navigate(`/recipe/${recipe.id}`)}
                        onFavourite={() => handleSaveFavourite(recipe)}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Recipe of the Week */}
              <section className="home-section">
                <div className="home-section-header">
                  <div>
                    <h3 className="home-section-title">Recipe of the Week</h3>
                    <p className="home-section-sub">
                      A new featured recipe every week
                    </p>
                  </div>
                </div>
                <div className="recipe-filter-section">
                  <div className="recipe-filter-pills">
                    {weekFilterOptions.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`recipe-filter-pill${weekType === type ? " active" : ""}`}
                        onClick={() => setWeekType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="recipe-carousel-wrapper">
                  <div className="recipe-carousel">
                    {filteredWeekRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        title={recipe.title}
                        image={recipe.image}
                        cuisineType={recipe.cuisineType}
                        dishType={recipe.dishType}
                        readyInMinutes={recipe.readyInMinutes}
                        difficulty={
                          recipe.readyInMinutes <= 30
                            ? "Easy"
                            : recipe.readyInMinutes <= 60
                              ? "Medium"
                              : "Hard"
                        }
                        isFavourited={favouriteIds.has(recipe.id)}
                        rating={ratings[recipe.id] ?? null}
                        onClick={() => navigate(`/recipe/${recipe.id}`)}
                        onFavourite={() => handleSaveFavourite(recipe)}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Most Favourite Recipes */}
              <section className="home-section">
                <div className="home-section-header">
                  <div>
                    <h3 className="home-section-title">Most Rated Recipes</h3>
                    <p className="home-section-sub">
                      Top rated recipes by our community
                    </p>
                  </div>
                </div>
                {topRatedRecipes.length === 0 ? (
                  <p className="home-empty">No rated recipes yet.</p>
                ) : (
                  <>
                    <div className="recipe-filter-section">
                      <div className="recipe-filter-pills">
                        {topFilterOptions.map((type) => (
                          <button
                            key={type}
                            type="button"
                            className={`recipe-filter-pill${topType === type ? " active" : ""}`}
                            onClick={() => setTopType(type)}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="recipe-carousel-wrapper">
                      <div className="recipe-carousel">
                        {filteredTopRecipes.map((recipe) => (
                          <RecipeCard
                            key={recipe.id}
                            title={recipe.title}
                            image={recipe.image}
                            cuisineType={recipe.cuisineType}
                            dishType={recipe.dishType}
                            readyInMinutes={recipe.readyInMinutes}
                            difficulty={
                              recipe.readyInMinutes <= 30
                                ? "Easy"
                                : recipe.readyInMinutes <= 60
                                  ? "Medium"
                                  : "Hard"
                            }
                            isFavourited={favouriteIds.has(recipe.id)}
                            rating={ratings[recipe.id] ?? null}
                            onClick={() => navigate(`/recipe/${recipe.id}`)}
                            onFavourite={() => handleSaveFavourite(recipe)}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </section>

              {/* From Our Community */}
              <section className="home-section">
                <div className="home-section-header">
                  <div>
                    <h3 className="home-section-title">From Our Community</h3>
                    <p className="home-section-sub">
                      Recipes created and shared by YumMeal users
                    </p>
                  </div>
                </div>
                {communityRecipes.length === 0 ? (
                  <p className="home-empty">
                    No community recipes yet. Be the first to add one!
                  </p>
                ) : (
                  <>
                    <div className="recipe-filter-section">
                      <div className="recipe-filter-pills">
                        {communityFilterOptions.map((type) => (
                          <button
                            key={type}
                            type="button"
                            className={`recipe-filter-pill${communityType === type ? " active" : ""}`}
                            onClick={() => setCommunityType(type)}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="recipe-carousel-wrapper">
                      <div className="recipe-carousel">
                        {filteredCommunityRecipes.map((recipe) => {
                          const cookMatch =
                            recipe.instructions?.match(/Cook: (\d+) min/);
                          const mins = cookMatch
                            ? parseInt(cookMatch[1])
                            : null;
                          const tagMatch =
                            recipe.instructions?.match(/Tags: ([^\n]+)/);
                          const tags = tagMatch
                            ? tagMatch[1]
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean)
                            : [];
                          return (
                            <RecipeCard
                              key={recipe._id}
                              title={recipe.name}
                              image={recipe.image || null}
                              cuisineType={tags[0] || null}
                              dishType={tags[1] || null}
                              readyInMinutes={mins}
                              difficulty={
                                mins == null
                                  ? null
                                  : mins <= 30
                                    ? "Easy"
                                    : mins <= 60
                                      ? "Medium"
                                      : "Hard"
                              }
                              hideHeart={true}
                              onClick={() =>
                                navigate(`/my-recipe/${recipe._id}`)
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </section>

              {/* YumMeal Team Picks */}
              <section className="home-section">
                <div className="home-section-header">
                  <div>
                    <h3 className="home-section-title">YumMeal Team Recipes</h3>
                    <p className="home-section-sub">
                      Recommended recipes from the YumMeal team
                    </p>
                  </div>
                </div>
                <div className="recipe-filter-section">
                  <div className="recipe-filter-pills">
                    {filterOptions.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`recipe-filter-pill${selectedType === type ? " active" : ""}`}
                        onClick={() => setSelectedType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="recipe-carousel-wrapper">
                  <div className="recipe-carousel" ref={teamCarouselRef}>
                    {filteredTeamRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        title={recipe.title}
                        image={recipe.image}
                        cuisineType={recipe.cuisineType}
                        dishType={recipe.dishType}
                        readyInMinutes={recipe.readyInMinutes}
                        difficulty={
                          recipe.readyInMinutes <= 30
                            ? "Easy"
                            : recipe.readyInMinutes <= 60
                              ? "Medium"
                              : "Hard"
                        }
                        isFavourited={favouriteIds.has(recipe.id)}
                        rating={ratings[recipe.id] ?? null}
                        onClick={() => navigate(`/recipe/${recipe.id}`)}
                        onFavourite={() => handleSaveFavourite(recipe)}
                      />
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Home;
