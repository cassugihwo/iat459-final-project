import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus } from "lucide-react";
import "remixicon/fonts/remixicon.css";
import Toast from "components/toast/UI_Toast";
import Confirmation from "components/confirm/Confirmation";
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

//Measurement units for ingredient input
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
  return [{ instruction: "" }];
}

function isNumber(value) {
  const v = value.trim();
  return v === "" || !Number.isNaN(Number(v));
}

function SavedRecipes() {
  const recipeVer = "user-recipes2";
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userRecipes, setUserRecipes] = useState([]);

  // Form state
  const [name, setName] = useState("");
  const [serves, setServes] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [ingredients, setIngredients] = useState(emptyIngredients());
  const [instructionsList, setInstructionsList] = useState(emptyInstructions());
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmEditRecipe, setConfirmEditRecipe] = useState(null);
  const [errors, setErrors] = useState("");
  const [editingId, setEditingId] = useState(null);

  function parseRecipeIntoForm(recipe) {
    const lines = (recipe.instructions || "").split("\n");
    const meta = lines[0] || "";
    const servesMatch = meta.match(/Serves:\s*(\d+)/);
    const cookMatch = meta.match(/Cook:\s*(\d+)\s*min/);
    const tagMatch = meta.match(/Tags:\s*([^|]+)/);
    const parsedServes = servesMatch ? servesMatch[1] : "";
    const parsedCook = cookMatch ? cookMatch[1] : "";
    const parsedTags = tagMatch
      ? tagMatch[1]
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    const parsedSteps = lines
      .slice(2)
      .map((l) => l.trim())
      .filter(Boolean);
    const parsedIngredients = (recipe.ingredients || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const m = s.match(
          /^([\d./\s]*)(\s*(?:g|kg|lb|ml|l|oz|tsp|tbsp|cup|pinch|piece))?\s+(.+)$/i,
        );
        if (m)
          return {
            amount: m[1].trim(),
            unit: m[2]?.trim() || "",
            name: m[3].trim(),
          };
        return { amount: "", unit: "", name: s };
      });
    return {
      serves: parsedServes,
      cookTime: parsedCook,
      tags: parsedTags,
      instructionsList: parsedSteps.length
        ? parsedSteps.map((s) => ({ instruction: s }))
        : emptyInstructions(),
      ingredients: parsedIngredients.length
        ? parsedIngredients
        : emptyIngredients(),
      name: recipe.name || "",
      imageBase64: recipe.image || "",
      imagePreview: recipe.image || "",
      isPublic: recipe.isPublic || false,
    };
  }

  const formSectionRef = useRef(null);

  function startEdit(recipe) {
    const parsed = parseRecipeIntoForm(recipe);
    setEditingId(recipe._id);
    setName(parsed.name);
    setServes(parsed.serves);
    setCookTime(parsed.cookTime);
    setTags(parsed.tags);
    setInstructionsList(parsed.instructionsList);
    setIngredients(parsed.ingredients);
    setImageBase64(parsed.imageBase64);
    setImagePreview(parsed.imagePreview);
    setIsPublic(parsed.isPublic);
    setErrors("");
    setTimeout(
      () =>
        formSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      50,
    );
  }

  function cancelEdit() {
    setEditingId(null);
    resetForm();
  }
  const privateRef = useRef(null);
  const publicRef = useRef(null);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch(`http://localhost:5001/api/${recipeVer}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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
    setInstructionsList(emptyInstructions());
    setTags([]);
    setTagInput("");
    setImageBase64("");
    setImagePreview("");
    setIsPublic(false);
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

    if (!filledIngredients) {
      setErrors("At least one ingredient is required");
      return;
    }

    const filledInstructions = instructionsList.filter((r) =>
      r.instruction.trim(),
    );
    if (!filledInstructions.length) {
      setErrors("At least one instruction step is required");
      return;
    }

    const tagString = tags.join(", ");
    const meta = `Serves: ${serves} | Cook: ${cookTime} min${tagString ? ` | Tags: ${tagString}` : ""}`;
    const joinedInstructions = filledInstructions
      .map((r) => r.instruction)
      .join("\n")
      .trim();
    const fullInstructions = `${meta}\n\n${joinedInstructions}`;

    try {
      if (editingId) {
        const response = await fetch(
          `http://localhost:5001/api/${recipeVer}/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: name.trim(),
              image: imageBase64,
              ingredients: filledIngredients,
              instructions: fullInstructions,
              isPublic,
            }),
          },
        );
        if (!response.ok) throw new Error("Failed to update recipe.");
        const updated = await response.json();
        setUserRecipes((prev) =>
          prev.map((r) => (r._id === editingId ? updated : r)),
        );
        setEditingId(null);
        resetForm();
      } else {
        const response = await fetch(`http://localhost:5001/api/${recipeVer}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            image: imageBase64,
            ingredients: filledIngredients,
            instructions: fullInstructions,
            isPublic,
          }),
        });
        if (!response.ok)
          throw new Error("Failed to add recipe. Are you authorized?");
        const newRecipe = await response.json();
        setUserRecipes((prev) => [...prev, newRecipe]);
        resetForm();
        setTimeout(() => {
          (newRecipe.isPublic ? publicRef : privateRef).current?.scrollIntoView(
            { behavior: "smooth", block: "start" },
          );
        }, 100);
      }
    } catch (err) {
      console.error("Failed form submit:", err);
      setErrors(err.message);
    }
  }

  async function confirmDelete() {
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
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
      setErrors(err.message);
    }
  }

  return (
    <div className="home-page">
      {confirmDeleteId && (
        <Confirmation
          title="Delete Recipe?"
          message="This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      {confirmEditRecipe && (
        <Confirmation
          title="Edit Recipe?"
          message={`Edit "${confirmEditRecipe.name}"? Your current form will be replaced.`}
          confirmLabel="Edit"
          onConfirm={() => {
            startEdit(confirmEditRecipe);
            setConfirmEditRecipe(null);
          }}
          onCancel={() => setConfirmEditRecipe(null)}
        />
      )}

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
              <h2>{editingId ? "Edit Recipe" : "Add My Recipes"}</h2>
            </div>
          </div>

          <div className="sr-body">
            {/* Add / Edit Recipe Form */}
            <section className="sr-form-section" ref={formSectionRef}>
              <Toast message={errors} onClose={() => setErrors("")} />

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

                {/* Serves + Cook time */}
                <div className="sr-row">
                  <div className="sr-field">
                    <label className="sr-label">Serves</label>
                    <input
                      className="sr-input"
                      type="number"
                      min="1"
                      value={serves}
                      onChange={(e) => setServes(e.target.value)}
                      placeholder="e.g. 4"
                    />
                  </div>
                  <div className="sr-field">
                    <label className="sr-label">Cook Time (mins)</label>
                    <input
                      className="sr-input"
                      type="number"
                      min="1"
                      value={cookTime}
                      onChange={(e) => setCookTime(e.target.value)}
                      placeholder="e.g. 30"
                    />
                  </div>
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
                              idx === i
                                ? { ...row, instruction: e.target.value }
                                : row,
                            );
                            setInstructionsList(newList);
                          }}
                          placeholder={`Describe step ${i + 1}...`}
                          rows={2}
                        />
                        {instructionsList.length > 1 && (
                          <button
                            type="button"
                            className="sr-btn-trash"
                            onClick={() => {
                              const newList = instructionsList.filter(
                                (_, idx) => idx !== i,
                              );
                              setInstructionsList(newList);
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
                  <button
                    type="button"
                    className="sr-btn-add"
                    onClick={() =>
                      setInstructionsList((prev) => [
                        ...prev,
                        { instruction: "" },
                      ])
                    }
                  >
                    <Plus size={16} />
                    Add Step
                  </button>
                </div>

                {/* Tags */}
                <div className="sr-field">
                  <label className="sr-label">Tags</label>
                  {tags.length > 0 && (
                    <div className="sr-tags-list">
                      {tags.map((t, i) => (
                        <span key={i} className="sr-tag-chip">
                          {t}
                          <button
                            type="button"
                            className="sr-tag-remove"
                            onClick={() =>
                              setTags((prev) =>
                                prev.filter((_, idx) => idx !== i),
                              )
                            }
                            aria-label={`Remove tag ${t}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="sr-tag-input-row">
                    <input
                      className="sr-input"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = tagInput.trim();
                          if (val && !tags.includes(val))
                            setTags((prev) => [...prev, val]);
                          setTagInput("");
                        }
                      }}
                      placeholder="e.g. Vietnamese"
                    />
                    <button
                      type="button"
                      className="sr-btn-add"
                      onClick={() => {
                        const val = tagInput.trim();
                        if (val && !tags.includes(val))
                          setTags((prev) => [...prev, val]);
                        setTagInput("");
                      }}
                    >
                      <Plus size={16} />
                      Add Tag
                    </button>
                  </div>
                </div>

                {/* Visibility */}
                <div className="sr-field">
                  <label className="sr-label">Visibility</label>
                  <div className="sr-visibility">
                    <button
                      type="button"
                      className={`sr-vis-opt${!isPublic ? " active" : ""}`}
                      onClick={() => setIsPublic(false)}
                    >
                      Private
                    </button>
                    <button
                      type="button"
                      className={`sr-vis-opt${isPublic ? " active" : ""}`}
                      onClick={() => setIsPublic(true)}
                    >
                      Public
                    </button>
                  </div>
                  <p className="sr-vis-hint">
                    {isPublic
                      ? "Anyone can see this recipe."
                      : "Only you can see this recipe."}
                  </p>
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
                    {editingId ? "Save Changes" : "Save Recipe"}
                  </button>
                  {editingId ? (
                    <button
                      className="sr-btn-clear"
                      type="button"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      className="sr-btn-clear"
                      type="button"
                      onClick={resetForm}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Recipe List */}
            <section className="sr-list-section">
              <h3 id="UserRecipeList" className="sr-section-title">
                My Recipes
              </h3>

              {userRecipes.length === 0 ? (
                <p className="sr-empty">No recipes yet. Add your first one!</p>
              ) : (
                <div className="sr-sections">
                  {[
                    {
                      label: "Private",
                      items: userRecipes.filter((r) => !r.isPublic),
                      ref: privateRef,
                    },
                    {
                      label: "Public",
                      items: userRecipes.filter((r) => r.isPublic),
                      ref: publicRef,
                    },
                  ].map(({ label, items, ref }) => (
                    <div key={label} className="sr-section" ref={ref}>
                      <div className="sr-section-header">
                        <span className="sr-section-label">{label}</span>
                        <div className="sr-section-line" />
                        <span className="sr-section-count">
                          {items.length} recipe{items.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {items.length === 0 ? (
                        <p className="sr-empty">
                          No {label.toLowerCase()} recipes yet.
                        </p>
                      ) : (
                        <div className="sr-list-scroll">
                          <div className="sr-list">
                            {items.map((recipe) => {
                              const cookMatch =
                                recipe.instructions?.match(/Cook: (\d+) min/);
                              const mins = cookMatch
                                ? parseInt(cookMatch[1])
                                : null;
                              const tagMatch =
                                recipe.instructions?.match(/Tags: ([^\n]+)/);
                              const tags = tagMatch
                                ? tagMatch[1].split(",").map((t) => t.trim())
                                : [];
                              return (
                                <div
                                  key={recipe._id}
                                  className="sr-card-wrapper"
                                >
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
                                    onClick={() =>
                                      navigate(`/my-recipe/${recipe._id}`)
                                    }
                                  />
                                  <div className="sr-card-actions">
                                    <button
                                      className="sr-btn-card-action"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmEditRecipe(recipe);
                                      }}
                                      aria-label={`Edit ${recipe.name}`}
                                      title="Edit recipe"
                                    >
                                      <i className="ri-edit-line" />
                                    </button>
                                    <button
                                      className="sr-btn-card-action sr-btn-card-delete"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDeleteId(recipe._id);
                                      }}
                                      aria-label={`Delete ${recipe.name}`}
                                      title="Delete recipe"
                                    >
                                      <i className="ri-delete-bin-line" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
