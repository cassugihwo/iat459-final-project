import { useContext, useEffect, useState } from "react";
import Toast from "components/toast/UI_Toast";
import "pages/MainPage.css";
import "pages/page-css/SavedRecipes.css";
import { AuthContext } from "context/AuthContext";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import RecipeCard from "components/recipe-card/UI_RecipeCard";
import Footer from "components/footer/UI_Footer";
import ScrollToTop from "components/scroll-to-top/UI_ScrollToTop";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";

const MEASUREMENT_UNITS = [
  "",
  "g",
  "kg",
  "lb",
  "ml",
  "l",
  "oz",
  "tsp",
  "tbsp",
  "cup",
  "pinch",
  "piece",
];

function emptyIngredients() {
  return Array.from({ length: 10 }, () => ({
    quantity: "",
    measurement: "",
    item: "",
  }));
}

function isNumber(value) {
  const v = value.trim();
  return v === "" || !Number.isNaN(Number(v));
}

function SavedRecipes() {
  const { token } = useContext(AuthContext);

  const [userRecipes, setUserRecipes] = useState([]);

  // Form state
  const [name, setName] = useState("");
  const [serves, setServes] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [ingredients, setIngredients] = useState(emptyIngredients());
  const [instructions, setInstructions] = useState("");
  const [tag, setTag] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState("");

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch("http://localhost:5001/api/user-recipes", {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: token },
        });
        if (!response.ok) throw new Error("Failed to fetch recipes.");
        const data = await response.json();
        setUserRecipes(data);
      } catch (err) {
        console.error("Error fetching recipes:", err);
      }
    }
    if (token) fetchRecipes();
  }, [token]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleIngredientChange(index, field, value) {
    setIngredients((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function resetForm() {
    setName("");
    setServes("");
    setCookTime("");
    setIngredients(emptyIngredients());
    setInstructions("");
    setTag("");
    setImageBase64("");
    setImagePreview("");
    setErrors("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors("");

    if (!name.trim()) {
      setErrors("Recipe name is required");
      return;
    }
    if (!serves) {
      setErrors("Serves is required");
      return;
    }
    if (!cookTime.trim()) {
      setErrors("Cook time is required");
      return;
    }
    if (!isNumber(cookTime)) {
      setErrors("Cook time must be a number");
      return;
    }

    for (let i = 0; i < ingredients.length; i++) {
      if (!isNumber(ingredients[i].quantity)) {
        setErrors(`Ingredient ${i + 1} quantity must be a number`);
        return;
      }
    }

    const filledIngredients = ingredients
      .filter((r) => r.quantity || r.measurement || r.item)
      .map((r) => [r.quantity, r.measurement, r.item].filter(Boolean).join(" "))
      .join(", ");

    const tags = tag
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .join(", ");

    const meta = `Serves: ${serves} | Cook: ${cookTime} min${tags ? ` | Tags: ${tags}` : ""}`;
    const fullInstructions = `${meta}\n\n${instructions.trim()}`;

    try {
      const response = await fetch("http://localhost:5001/api/user-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          name: name.trim(),
          image: imageBase64,
          ingredients: filledIngredients,
          instructions: fullInstructions,
        }),
      });
      if (!response.ok)
        throw new Error("Failed to add recipe. Are you authorized?");
      const newRecipe = await response.json();
      setUserRecipes((prev) => [...prev, newRecipe]);
      resetForm();
    } catch (err) {
      console.error("Failed form submit:", err);
      setErrors(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(
        `http://localhost:5001/api/user-recipes/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: token },
        },
      );
      if (!response.ok)
        throw new Error("Failed to delete. Are you authorized?");
      setUserRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      setErrors(err.message);
    }
  }

  return (
    <div className="home-page">
      <Toast message={errors} onClose={() => setErrors("")} />
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
              <h2>Add My Recipes</h2>
            </div>
          </div>

          <div className="sr-body">
            {/* ── Add Recipe Form ── */}
            <section className="sr-form-section">

              <form className="sr-form" onSubmit={handleSubmit}>
                {/* Name */}
                <div className="sr-field">
                  <label className="sr-label">Recipe Name</label>
                  <input
                    className="sr-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Grilled Chicken"
                  />
                </div>

                {/* Serves */}
                <div className="sr-field">
                  <label className="sr-label">Serves</label>
                  <div className="sr-serves">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <label
                        key={n}
                        className={`sr-serve-opt${serves === String(n) ? " active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="serves"
                          value={n}
                          checked={serves === String(n)}
                          onChange={(e) => setServes(e.target.value)}
                        />
                        {n}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cook time */}
                <div className="sr-field">
                  <label className="sr-label">Cook Time (mins)</label>
                  <input
                    className="sr-input"
                    type="text"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    placeholder="e.g. 30"
                  />
                </div>

                {/* Ingredients table */}
                <div className="sr-field">
                  <label className="sr-label">Ingredients</label>
                  <div className="sr-table-wrapper">
                    <table className="sr-table">
                      <thead>
                        <tr>
                          <th>Quantity</th>
                          <th>Measurement</th>
                          <th>Item</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ingredients.map((row, i) => (
                          <tr key={i}>
                            <td>
                              <input
                                className="sr-input"
                                type="text"
                                value={row.quantity}
                                onChange={(e) =>
                                  handleIngredientChange(
                                    i,
                                    "quantity",
                                    e.target.value,
                                  )
                                }
                                placeholder="200"
                              />
                            </td>
                            <td>
                              <select
                                className="sr-select"
                                value={row.measurement}
                                onChange={(e) =>
                                  handleIngredientChange(
                                    i,
                                    "measurement",
                                    e.target.value,
                                  )
                                }
                              >
                                {MEASUREMENT_UNITS.map((u, j) => (
                                  <option key={j} value={u}>
                                    {u || "—"}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input
                                className="sr-input"
                                type="text"
                                value={row.item}
                                onChange={(e) =>
                                  handleIngredientChange(
                                    i,
                                    "item",
                                    e.target.value,
                                  )
                                }
                                placeholder="Chicken Breast"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Instructions */}
                <div className="sr-field">
                  <label className="sr-label">Instructions</label>
                  <textarea
                    className="sr-textarea"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Write the cooking steps here..."
                    rows={6}
                  />
                </div>

                {/* Tags */}
                <div className="sr-field">
                  <label className="sr-label">Tags</label>
                  <input
                    className="sr-input"
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. Vietnamese, Pasta, Vegan"
                  />
                </div>

                {/* Image upload */}
                <div className="sr-field">
                  <label className="sr-label">Recipe Image (Optional)</label>
                  <label className="sr-image-upload">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="sr-image-preview"
                      />
                    ) : (
                      <span className="sr-image-placeholder">
                        Click to upload an image
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      hidden
                    />
                  </label>
                </div>

                <div className="sr-actions">
                  <button className="sr-btn-save" type="submit">
                    Save Recipe
                  </button>
                  <button
                    className="sr-btn-clear"
                    type="button"
                    onClick={resetForm}
                  >
                    Clear
                  </button>
                </div>
              </form>
            </section>

            {/* ── Recipe List ── */}
            <section className="sr-list-section">
              <h3 className="sr-section-title">Your Recipes</h3>

              {userRecipes.length === 0 ? (
                <p className="sr-empty">No recipes yet. Add your first one!</p>
              ) : (
                <div className="sr-list">
                  {userRecipes.map((recipe) => {
                    const cookMatch =
                      recipe.instructions?.match(/Cook: (\d+) min/);
                    const mins = cookMatch ? parseInt(cookMatch[1]) : null;
                    const tagMatch =
                      recipe.instructions?.match(/Tags: ([^\n]+)/);
                    const tags = tagMatch
                      ? tagMatch[1].split(",").map((t) => t.trim())
                      : [];
                    return (
                      <div key={recipe._id} className="sr-card-wrapper">
                        <RecipeCard
                          title={recipe.name}
                          image={recipe.image}
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
                        />
                        <button
                          className="sr-btn-delete"
                          onClick={() => handleDelete(recipe._id)}
                          aria-label={`Delete ${recipe.name}`}
                          title="Delete recipe"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
}

export default SavedRecipes;
