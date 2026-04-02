import { useMemo, useState } from "react";
import "pages/MainPage.css";
import "pages/page-css/FindRecipes.css";
import { useNavigate } from "react-router-dom";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import RecipeCard from "components/recipe-card/UI_RecipeCard";
import Footer from "components/footer/UI_Footer";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";

const MAX_TIME = 120;


function formatTime(mins) {
    if (mins >= MAX_TIME) return "Any time";
    if (mins < 60) return `Up to ${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m === 0 ? `Up to ${h} hr` : `Up to ${h} hr ${m} min`;
}

function capitalize(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function FindRecipes() {
    const navigate = useNavigate();

    const [inputValue, setInputValue]   = useState("");
    const [ingredients, setIngredients] = useState([]);
    const [recipes, setRecipes]         = useState([]);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState("");
    const [searched, setSearched]       = useState(false);

    // Filters
    const [sortBy, setSortBy]                   = useState("bestMatch");
    const [maxCookTime, setMaxCookTime]         = useState(MAX_TIME);
    const [selectedCuisines, setSelectedCuisines]   = useState([]);
    const [selectedDietary, setSelectedDietary]     = useState([]);
    const [selectedDishTypes, setSelectedDishTypes] = useState([]);

    function addIngredient() {
        const trimmed = inputValue.trim();
        if (trimmed && !ingredients.includes(trimmed.toLowerCase())) {
            setIngredients((prev) => [...prev, trimmed.toLowerCase()]);
        }
        setInputValue("");
    }

    function removeIngredient(item) {
        setIngredients((prev) => prev.filter((i) => i !== item));
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            addIngredient();
        }
    }

    function resetFilters() {
        setSortBy("bestMatch");
        setMaxCookTime(MAX_TIME);
        setSelectedCuisines([]);
        setSelectedDietary([]);
        setSelectedDishTypes([]);
    }

    async function handleSearch() {
        if (ingredients.length === 0) return;
        setLoading(true);
        setError("");
        setSearched(true);
        resetFilters();
        try {
            const query = ingredients.join(",");
            const response = await fetch(
                `http://localhost:5001/api/find-by-ingredients?ingredients=${encodeURIComponent(query)}`
            );
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to fetch recipes.");
            setRecipes(data);
        } catch (err) {
            setError(err.message || "Could not load recipes.");
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    }

    function toggleItem(setList, value) {
        setList((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    }

    // Build dynamic option lists from results
    const cuisineOptions = useMemo(() => {
        const counts = {};
        recipes.forEach((r) => { if (r.cuisine) counts[r.cuisine] = (counts[r.cuisine] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [recipes]);

    const dietaryOptions = useMemo(() => {
        const counts = {};
        recipes.forEach((r) => { if (r.dietary) counts[r.dietary] = (counts[r.dietary] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [recipes]);

    const dishTypeOptions = useMemo(() => {
        const counts = {};
        recipes.forEach((r) => { if (r.dishType) counts[r.dishType] = (counts[r.dishType] || 0) + 1; });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [recipes]);

    // Apply all filters
    const filteredRecipes = useMemo(() => {
        let result = [...recipes];

        if (maxCookTime < MAX_TIME) {
            result = result.filter((r) => r.readyInMinutes != null && r.readyInMinutes <= maxCookTime);
        }

        if (selectedCuisines.length > 0) {
            result = result.filter((r) => r.cuisine && selectedCuisines.includes(r.cuisine));
        }

        if (selectedDietary.length > 0) {
            result = result.filter((r) => r.dietary && selectedDietary.includes(r.dietary));
        }

        if (selectedDishTypes.length > 0) {
            result = result.filter((r) => r.dishType && selectedDishTypes.includes(r.dishType));
        }

        if (sortBy === "az") {
            result.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === "cookTime") {
            result.sort((a, b) => (a.readyInMinutes ?? Infinity) - (b.readyInMinutes ?? Infinity));
        }

        return result;
    }, [recipes, sortBy, maxCookTime, selectedCuisines, selectedDietary, selectedDishTypes]);

    const showResults = searched && !loading && !error && recipes.length > 0;

    return (
        <div className="home-page">
            <div className="navbarHeader">
                <NavbarHeader />
            </div>

            <div className="bg">
                <div className="bg-food bg-food-left"><img src={leftDish} alt="Decorative dish" /></div>
                <div className="bg-food bg-food-center"><img src={centerDish} alt="Decorative dish" /></div>
                <div className="bg-food bg-food-right"><img src={rightDish} alt="Decorative dish" /></div>
                <div className="bg-logo"><img src={logo} alt="YumMeal Logo" /></div>
                <div className="bg-gradient"></div>
            </div>

            <div className="main">
                <div className="navbar"><Navbar /></div>

                <div className="main-content">
                    <div className="find-hero">
                        <h2 className="find-hero-title">
                            Recipes with your ingredients
                        </h2>
                    </div>

                    <div className="find-recipes-body">
                        {/* Ingredient input */}
                        <div className="ingredient-form">
                            <div className="ingredient-input-row">
                                <input
                                    type="text"
                                    placeholder="Type an ingredient..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button className="btn-add" onClick={addIngredient}>Add</button>
                                <button className="btn-search" onClick={handleSearch} disabled={ingredients.length === 0}>
                                    Search
                                </button>
                            </div>
                            <p className="ingredient-form-label">"Add" in your ingredients and "Search" for the recipes</p>
                            {ingredients.length > 0 && (
                                <div className="ingredient-tags">
                                    {ingredients.map((item) => (
                                        <span key={item} className="ingredient-tag">
                                            {item}
                                            <button className="tag-remove" onClick={() => removeIngredient(item)} aria-label={`Remove ${item}`}>×</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="find-results-layout">

                            {/* Sidebar */}
                            <aside className="find-sidebar">
                                <p className="sidebar-title">REFINE RESULTS</p>

                                {/* Cook Time */}
                                <div className="sidebar-section">
                                    <div className="sidebar-section-header">
                                        <p className="sidebar-section-label">Max Cook Time</p>
                                        {maxCookTime < MAX_TIME && (
                                            <button className="sidebar-clear" onClick={() => setMaxCookTime(MAX_TIME)}>Reset</button>
                                        )}
                                    </div>
                                    <input
                                        type="range"
                                        className="cook-time-slider"
                                        min={10}
                                        max={MAX_TIME}
                                        step={5}
                                        value={maxCookTime}
                                        onChange={(e) => setMaxCookTime(Number(e.target.value))}
                                    />
                                    <div className="cook-time-range-labels">
                                        <span>10 min</span>
                                        <span>2 hr</span>
                                    </div>
                                    <p className="cook-time-value">{formatTime(maxCookTime)}</p>
                                </div>

                                <div className="sidebar-divider" />

                                {/* Cuisine */}
                                <div className="sidebar-section">
                                    <div className="sidebar-section-header">
                                        <p className="sidebar-section-label">Cuisine</p>
                                        {selectedCuisines.length > 0 && (
                                            <button className="sidebar-clear" onClick={() => setSelectedCuisines([])}>Clear</button>
                                        )}
                                    </div>
                                    {cuisineOptions.length === 0 ? (
                                        <p className="sidebar-empty">Search to see options</p>
                                    ) : (
                                        <div className="checkbox-list">
                                            {cuisineOptions.map(([cuisine, count]) => (
                                                <label key={cuisine} className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCuisines.includes(cuisine)}
                                                        onChange={() => toggleItem(setSelectedCuisines, cuisine)}
                                                    />
                                                    <span className="checkbox-text">{capitalize(cuisine)}</span>
                                                    <span className="checkbox-count">{count}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="sidebar-divider" />

                                {/* Dietary */}
                                <div className="sidebar-section">
                                    <div className="sidebar-section-header">
                                        <p className="sidebar-section-label">Dietary</p>
                                        {selectedDietary.length > 0 && (
                                            <button className="sidebar-clear" onClick={() => setSelectedDietary([])}>Clear</button>
                                        )}
                                    </div>
                                    {dietaryOptions.length === 0 ? (
                                        <p className="sidebar-empty">Search to see options</p>
                                    ) : (
                                        <div className="checkbox-list">
                                            {dietaryOptions.map(([diet, count]) => (
                                                <label key={diet} className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDietary.includes(diet)}
                                                        onChange={() => toggleItem(setSelectedDietary, diet)}
                                                    />
                                                    <span className="checkbox-text">{capitalize(diet)}</span>
                                                    <span className="checkbox-count">{count}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="sidebar-divider" />

                                {/* Dish Type */}
                                <div className="sidebar-section">
                                    <div className="sidebar-section-header">
                                        <p className="sidebar-section-label">Dish Type</p>
                                        {selectedDishTypes.length > 0 && (
                                            <button className="sidebar-clear" onClick={() => setSelectedDishTypes([])}>Clear</button>
                                        )}
                                    </div>
                                    {dishTypeOptions.length === 0 ? (
                                        <p className="sidebar-empty">Search to see options</p>
                                    ) : (
                                        <div className="checkbox-list">
                                            {dishTypeOptions.map(([type, count]) => (
                                                <label key={type} className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedDishTypes.includes(type)}
                                                        onChange={() => toggleItem(setSelectedDishTypes, type)}
                                                    />
                                                    <span className="checkbox-text">{capitalize(type)}</span>
                                                    <span className="checkbox-count">{count}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </aside>

                            {/* Main results */}
                            <div className="find-main">
                                {loading && <p className="find-status">Searching...</p>}
                                {error && <p className="find-status find-error">{error}</p>}
                                {searched && !loading && !error && recipes.length === 0 && (
                                    <p className="find-status">No recipes found for those ingredients.</p>
                                )}

                                {showResults && (
                                    <>
                                        <div className="find-results-header">
                                            <div className="find-count">
                                                <span className="count-number">{filteredRecipes.length}</span>
                                                <span className="count-label">recipes found matching your ingredients</span>
                                            </div>
                                            <div className="find-sort">
                                                <label className="sort-label">Sort By</label>
                                                <select
                                                    className="sort-select"
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                >
                                                    <option value="bestMatch">Best Match</option>
                                                    <option value="az">A–Z</option>
                                                    <option value="cookTime">Cook Time</option>
                                                </select>
                                            </div>
                                        </div>

                                        {filteredRecipes.length === 0 ? (
                                            <p className="find-status">No recipes match these filters.</p>
                                        ) : (
                                            <div className="find-results-grid">
                                                {filteredRecipes.map((recipe) => (
                                                    <div key={recipe.id} className="find-card-wrapper">
                                                        <RecipeCard
                                                            title={recipe.title}
                                                            image={recipe.image}
                                                            cuisineType={recipe.cuisine}
                                                            dishType={recipe.dishType}
                                                            readyInMinutes={recipe.readyInMinutes}
                                                            difficulty={
                                                                recipe.readyInMinutes <= 30 ? "Easy"
                                                                : recipe.readyInMinutes <= 60 ? "Medium"
                                                                : "Hard"
                                                            }
                                                            onClick={() => navigate(`/recipe/${recipe.id}`)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
}

export default FindRecipes;
