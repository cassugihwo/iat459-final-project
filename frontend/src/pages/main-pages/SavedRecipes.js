import { useContext, useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import Toast from "components/toast/UI_Toast";
import "pages/MainPage.css";
import "pages/page-css/RecipeDetail.css";
import "pages/page-css/SavedRecipes.css";
import { AuthContext } from "context/AuthContext";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import RecipeCard from "components/recipe-card/UI_RecipeCard";
import Footer from "components/footer/UI_Footer";
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
  return Array.from({ length: 4 }, () => ({
    amount: "",
    unit: "",
    name: "",
  }));
}


function emptyInstructions() {
  return Array.from({ length: 4 }, () => ({
    instruction: ""
  }));
}

function emptyInstructions() {
  return [{ instruction: "" }];
}

function isNumber(value) {
  const v = value.trim();
  return v === "" || !Number.isNaN(Number(v));
}

function SavedRecipes() {
  const recipeVer = "user-recipes2";
  const { token } = useContext(AuthContext);

  const [userRecipes, setUserRecipes] = useState([]);

  // Form state
  const [name, setName] = useState("");
  const [serves, setServes] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [ingredients, setIngredients] = useState(emptyIngredients());
  const [instructions, setInstructions] = useState("");
  const [instructionsList, setInstructionsList] = useState(emptyInstructions());
  const [tag, setTag] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState("");

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch(`http://localhost:5001/api/${recipeVer}`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
    setInstructionsList(emptyInstructions());
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
      if (!isNumber(ingredients[i].amount)) {
        setErrors(`Ingredient ${i + 1} quantity must be a number`);
        return;
      }
    }

    const filledIngredients = ingredients
      .filter((r) => r.amount || r.unit || r.name)
      .map((r) => [r.amount, r.unit, r.name].filter(Boolean).join(" "))
      .join(", ");

    const tags = tag
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .join(", ");

    const meta = `Serves: ${serves} | Cook: ${cookTime} min${tags ? ` | Tags: ${tags}` : ""}`;
    const joinedInstructions = instructionsList.map(r => r.instruction).join("\n").trim();
    const fullInstructions = `${meta}\n\n${joinedInstructions}`;

    try {
      const response = await fetch(`http://localhost:5001/api/${recipeVer}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      document.getElementById("UserRecipeList")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Failed form submit:", err);
      setErrors(err.message);
    }
    

  }

  async function handleDelete(id) {
    try {
      const response = await fetch(
        `http://localhost:5001/api/${recipeVer}/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok)
        throw new Error("Failed to delete. Are you authorized?");
      setUserRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
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
              {errors && <div className="sr-error">{errors}</div>}

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
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {ingredients.map((row, i) => (
                          <tr key={i} className="sr-ingredient-row">
                            <td>
                              <input
                                className="sr-input"
                                type="text"
                                value={row.amount}
                                onChange={(e) =>
                                  handleIngredientChange(
                                    i,
                                    "amount",
                                    e.target.value,
                                  )
                                }
                                placeholder="0"
                              />
                            </td>
                            <td>
                              <select
                                className="sr-select"
                                value={row.unit}
                                onChange={(e) =>
                                  handleIngredientChange(
                                    i,
                                    "unit",
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
                                value={row.name}
                                onChange={(e) =>
                                  handleIngredientChange(
                                    i,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                placeholder="Ingredient name"
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="sr-btn-trash"
                                onClick={() => {
                                  setIngredients((prev) =>
                                    prev.filter((_, idx) => idx !== i),
                                  );
                                }}
                                tabIndex="-1"
                                aria-label="Remove ingredient"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    className="sr-btn-add"
                    onClick={() =>
                      setIngredients((prev) => [
                        ...prev,
                        { quantity: "", measurement: "", item: "" },
                      ])
                    }
                  >
                    <Plus size={18} style={{ marginRight: 6, verticalAlign: "middle" }} />
                        { amount: "", unit: "", name: "" },
                      ])
                    }
                  >
                    <Plus
                      size={18}
                      style={{ marginRight: 6, verticalAlign: "middle" }}
                    />
                    Add Ingredient
                  </button>
                </div>

                {/* Instructions (WIP) */}
                <div className="sr-field">
                  <label className="sr-label">Instructions</label>
                  <div className="sr-steps-list">
                    {instructionsList.map((row, i) => (
                      <div key={i} className="sr-step-row">
                        <span className="sr-step-num">{i + 1}</span>
                        <textarea
                          className="sr-textarea sr-step-textarea"
                          value={row.instruction}
                          onChange={(e) => {
                            const newList = instructionsList.map((row, idx) =>
                              idx === i ? { ...row, instruction: e.target.value } : row
                            );
                            setInstructionsList(newList);
                            setInstructions(newList.map(r => r.instruction).join("\n"));
                          }}
                          placeholder={`Describe step ${i + 1}...`}
                          rows={2}
                        />
                        {instructionsList.length > 1 && (
                          <button
                            type="button"
                            className="sr-btn-trash"
                            onClick={() => {
                              const newList = instructionsList.filter((_, idx) => idx !== i);
                              setInstructionsList(newList);
                              setInstructions(newList.map(r => r.instruction).join("\n"));
                            }}
                            tabIndex="-1"
                            aria-label="Remove step"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="sr-table-wrapper">
                    <table className="sr-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Instructions</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {instructionsList.map((row, i) => (
                          <tr key={i} className="sr-instruction-row">
                            <td className="rd-step-number">
                              {i + 1}
                            </td>
                            <td>
                              <textarea
                                className="sr-textarea rd-step-text"
                                value={row.instruction}
                                onChange={(e) => {
                                  const newList = [...instructionsList];
                                  newList[i].instruction = e.target.value;
                                  setInstructionsList(newList);
                                  setInstructions(newList.map(r => r.instruction).join("\n"));
                                }}
                                placeholder={`Step ${i + 1}`}
                                rows={2}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="sr-btn-trash"
                                onClick={() => {
                                  const newList = instructionsList.filter((_, idx) => idx !== i);
                                  setInstructionsList(newList);
                                  setInstructions(newList.map(r => r.instruction).join("\n"));
                                }}
                                tabIndex="-1"
                                aria-label="Remove instruction"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  <button
                    type="button"
                    className="sr-btn-add"
                    onClick={() =>
                      setInstructionsList((prev) => [...prev, { instruction: "" }])
                    }
                  >
                    <Plus size={16} />
                    Add Step
                  </button>
                </div>
                      setInstructionsList((prev) => [
                        ...prev,
                        { instruction: "" },
                      ])
                    }
                  >
                    <Plus
                      size={18}
                      style={{ marginRight: 6, verticalAlign: "middle" }}
                    />
                    Add Instruction
                  </button>
                </div>


                {/* Instructions (old) */}
                {/* <div className="sr-field">
                  <label className="sr-label">Instructions</label>
                  <textarea
                    className="sr-textarea"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Write the cooking steps here..."
                    rows={6}
                  />
                </div> */}

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
              <h3 id="UserRecipeList" className="sr-section-title">Your Recipes</h3>

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
      </div>
    </div>
  );
}

export default SavedRecipes;
