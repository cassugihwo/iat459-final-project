import { useState } from "react";
import "remixicon/fonts/remixicon.css";
import { timeAgo } from "./Utils";
import "pages/page-css/SavedRecipes.css";
import "pages/page-css/MyRecipeDetail.css";
import "./css/UserRecipes.css";
import "./css/TeamRecipes.css";
import logo from "assets/logo/logo-full.png";

function parseIngredient(str) {
  const match = str.match(
    /^(\d[\d/.\s]*(?:cups?|tbsp?|tsp?|oz|lbs?|g|kg|ml|l|cloves?|pieces?|slices?|cans?|bunches?|handful|pinch|dash|to taste)?)\s+(.+)/i,
  );
  if (match) {
    return { amount: match[1].trim(), name: match[2].trim() };
  }
  return { amount: "—", name: str };
}

function TeamRecipeDetailModal({ recipe, onClose }) {
  const ingredients = (recipe.ingredients || "")
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);
  const steps = (recipe.instructions || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const tags = recipe.tags?.length
    ? recipe.tags
    : [recipe.cuisineType, recipe.dishType].filter(Boolean);
  const createdDate = recipe.createdAt
    ? new Date(recipe.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <div className="admin-modal-header">
          <div />
          <button className="admin-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Hero image */}
        <div className="mrd-hero" style={{ margin: 0, height: "16rem" }}>
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.name} />
          ) : (
            <div className="mrd-hero-placeholder">
              <img src={logo} alt="YumMeal" />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="mrd-title" style={{ marginTop: "1rem" }}>
          {recipe.name}
        </h1>

        {/* Meta chips */}
        <div className="mrd-meta">
          {recipe.readyInMinutes && (
            <span className="mrd-chip highlight">
              {recipe.readyInMinutes} min
            </span>
          )}
          {recipe.difficulty && (
            <span className="mrd-chip highlight">{recipe.difficulty}</span>
          )}
          {tags.map((tag, i) => (
            <span key={i} className="mrd-chip">
              {tag}
            </span>
          ))}
        </div>

        {/* Author + Date */}
        <div className="mrd-owner-row">
          <div className="mrd-owner-avatar mrd-owner-initials">YM</div>
          <div>
            <p className="mrd-owner-name">YumMeal Team</p>
            <p className="mrd-owner-date">Created {createdDate}</p>
          </div>
        </div>

        {/* Description */}
        {recipe.description && (
          <p
            style={{
              fontFamily: "Noto Sans, sans-serif",
              fontSize: "0.95rem",
              color: "#555",
              lineHeight: "1.6",
              margin: "0",
            }}
          >
            {recipe.description}
          </p>
        )}

        {/* Body: ingredients + instructions */}
        <div className="mrd-body">
          <div className="mrd-ingredients-section">
            <h2 className="mrd-section-title">Ingredients</h2>
            {ingredients.length === 0 ? (
              <p style={{ color: "#888", fontFamily: "Noto Sans, sans-serif" }}>
                No ingredients listed.
              </p>
            ) : (
              <div className="mrd-ingredients-columns">
                <div className="mrd-ingredients-col">
                  <p className="mrd-col-label">Item</p>
                  <ul className="mrd-ingredients">
                    {ingredients.map((ing, i) => (
                      <li key={i} className="mrd-ingredient-name">
                        <span>{parseIngredient(ing).name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mrd-ingredients-col">
                  <p className="mrd-col-label">Amount</p>
                  <ul className="mrd-ingredients">
                    {ingredients.map((ing, i) => (
                      <li key={i} className="mrd-ingredient-amount">
                        {parseIngredient(ing).amount}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="mrd-instructions-section">
            <h2 className="mrd-section-title">Instructions</h2>
            {steps.length === 0 ? (
              <p style={{ color: "#888", fontFamily: "Noto Sans, sans-serif" }}>
                No instructions provided.
              </p>
            ) : (
              <div className="mrd-steps">
                {steps.map((step, i) => (
                  <div key={i} className="mrd-step">
                    <span className="mrd-step-number">{i + 1}</span>
                    <p className="mrd-step-text">{step}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  return Array.from({ length: 4 }, () => ({ amount: "", unit: "", name: "" }));
}

function emptyInstructions() {
  return [{ instruction: "" }];
}

function isNumber(value) {
  const v = value.trim();
  return v === "" || !Number.isNaN(Number(v));
}

const EMPTY_FORM = {
  name: "",
  serves: "",
  cookTime: "",
  ingredients: emptyIngredients(),
  instructionsList: emptyInstructions(),
  tags: [],
  tagInput: "",
  imageBase64: "",
  imagePreview: "",
};

export default function AdminTeamRecipes({
  teamRecipes,
  token,
  onRefresh,
  setPendingAction,
  deleteTeamRecipe,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setField("imageBase64", reader.result);
      setField("imagePreview", reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleIngredientChange(index, field, value) {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      ),
    }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Recipe name is required.");
      return;
    }
    if (!form.cookTime.trim()) {
      setError("Cook time is required.");
      return;
    }
    if (!isNumber(form.cookTime)) {
      setError("Cook time must be a number.");
      return;
    }

    for (let i = 0; i < form.ingredients.length; i++) {
      if (!isNumber(form.ingredients[i].amount)) {
        setError(`Ingredient ${i + 1} quantity must be a number.`);
        return;
      }
    }

    const filledIngredients = form.ingredients
      .filter((r) => r.amount || r.unit || r.name)
      .map((r) => [r.amount, r.unit, r.name].filter(Boolean).join(" "))
      .join(", ");

    if (!filledIngredients) {
      setError("At least one ingredient is required.");
      return;
    }

    const filledInstructions = form.instructionsList.filter((r) =>
      r.instruction.trim(),
    );
    if (!filledInstructions.length) {
      setError("At least one instruction step is required.");
      return;
    }

    const cookTimeNum = Number(form.cookTime);
    const difficulty =
      cookTimeNum <= 30 ? "Easy" : cookTimeNum <= 60 ? "Medium" : "Hard";
    const joinedInstructions = filledInstructions
      .map((r) => r.instruction)
      .join("\n")
      .trim();

    setSaving(true);
    try {
      const res = await fetch("http://localhost:5001/api/team-recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          image: form.imageBase64,
          ingredients: filledIngredients,
          instructions: joinedInstructions,
          tags: form.tags,
          readyInMinutes: cookTimeNum || null,
          difficulty,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create recipe.");
      }
      resetForm();
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tr-layout">
      {/* Create Form */}
      <div className="tr-form-panel">
        <h2 className="tr-form-title">Add Recipe</h2>

        <section className="sr-form-section tr-form-section-override">
          {error && <p className="tr-error">{error}</p>}

          <form className="sr-form" onSubmit={handleSubmit}>
            {/* Recipe Name */}
            <div className="sr-field">
              <label className="sr-label">Recipe Name *</label>
              <input
                className="sr-input"
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Recipe Name"
              />
            </div>

            {/* Serves + Cook Time */}
            <div className="sr-row">
              <div className="sr-field">
                <label className="sr-label">Serves</label>
                <input
                  className="sr-input"
                  type="number"
                  min="1"
                  value={form.serves}
                  onChange={(e) => setField("serves", e.target.value)}
                  placeholder="e.g. 4"
                />
              </div>
              <div className="sr-field">
                <label className="sr-label">Cook Time (mins) *</label>
                <input
                  className="sr-input"
                  type="number"
                  min="1"
                  value={form.cookTime}
                  onChange={(e) => setField("cookTime", e.target.value)}
                  placeholder="e.g. 30"
                />
              </div>
            </div>

            {/* Ingredients */}
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
                    {form.ingredients.map((row, i) => (
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
                              handleIngredientChange(i, "unit", e.target.value)
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
                              handleIngredientChange(i, "name", e.target.value)
                            }
                            placeholder="Ingredient name"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="sr-btn-trash"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                ingredients: prev.ingredients.filter(
                                  (_, idx) => idx !== i,
                                ),
                              }))
                            }
                            tabIndex="-1"
                            aria-label="Remove ingredient"
                          >
                            <i className="ri-delete-bin-line" />
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
                  setForm((prev) => ({
                    ...prev,
                    ingredients: [
                      ...prev.ingredients,
                      { amount: "", unit: "", name: "" },
                    ],
                  }))
                }
              >
                <i className="ri-add-line tr-btn-icon" />
                Add Ingredient
              </button>
            </div>

            {/* Instructions */}
            <div className="sr-field">
              <label className="sr-label">Instructions</label>
              <div className="sr-steps-list">
                {form.instructionsList.map((row, i) => (
                  <div key={i} className="sr-step-row">
                    <span className="sr-step-num">{i + 1}</span>
                    <textarea
                      className="sr-textarea sr-step-textarea"
                      value={row.instruction}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          instructionsList: prev.instructionsList.map(
                            (r, idx) =>
                              idx === i
                                ? { ...r, instruction: e.target.value }
                                : r,
                          ),
                        }))
                      }
                      placeholder={`Describe step ${i + 1}...`}
                      rows={2}
                    />
                    {form.instructionsList.length > 1 && (
                      <button
                        type="button"
                        className="sr-btn-trash"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            instructionsList: prev.instructionsList.filter(
                              (_, idx) => idx !== i,
                            ),
                          }))
                        }
                        tabIndex="-1"
                        aria-label="Remove step"
                      >
                        <i className="ri-delete-bin-line" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="sr-btn-add"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    instructionsList: [
                      ...prev.instructionsList,
                      { instruction: "" },
                    ],
                  }))
                }
              >
                <i className="ri-add-line tr-btn-icon" />
                Add Step
              </button>
            </div>

            {/* Tags */}
            <div className="sr-field">
              <label className="sr-label">Tags (Optional)</label>
              {form.tags.length > 0 && (
                <div className="sr-tags-list">
                  {form.tags.map((t, i) => (
                    <span key={i} className="sr-tag-chip">
                      {t}
                      <button
                        type="button"
                        className="sr-tag-remove"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            tags: prev.tags.filter((_, idx) => idx !== i),
                          }))
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
                  value={form.tagInput}
                  onChange={(e) => setField("tagInput", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = form.tagInput.trim();
                      if (val && !form.tags.includes(val))
                        setForm((prev) => ({
                          ...prev,
                          tags: [...prev.tags, val],
                          tagInput: "",
                        }));
                      else setField("tagInput", "");
                    }
                  }}
                  placeholder="e.g. Italian"
                />
                <button
                  type="button"
                  className="sr-btn-add"
                  onClick={() => {
                    const val = form.tagInput.trim();
                    if (val && !form.tags.includes(val))
                      setForm((prev) => ({
                        ...prev,
                        tags: [...prev.tags, val],
                        tagInput: "",
                      }));
                    else setField("tagInput", "");
                  }}
                >
                  <i className="ri-add-line tr-btn-icon" />
                  Add Tag
                </button>
              </div>
            </div>

            {/* Image upload */}
            <div className="sr-field">
              <label className="sr-label">Recipe Image (Optional)</label>
              <label className="sr-image-upload">
                {form.imagePreview ? (
                  <img
                    src={form.imagePreview}
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
              <button className="sr-btn-save" type="submit" disabled={saving}>
                {saving ? "Adding..." : "Add Recipe"}
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
      </div>

      {/* Existing Team Recipes Table */}
      <div className="tr-table-col">
        <h2 className="tr-form-title">Team Recipes</h2>
        <div className="admin-panel full">
          <table className="admin-table recipes-table">
            <colgroup>
              <col className="tr-col-name" />
              <col className="tr-col-tags" />
              <col className="tr-col-time" />
              <col className="tr-col-added" />
              <col className="tr-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th>Recipe</th>
                <th>Tags</th>
                <th>Time</th>
                <th>Added</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamRecipes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-row">
                    No team recipes yet. Add one above.
                  </td>
                </tr>
              ) : (
                teamRecipes.map((r) => {
                  const tags = r.tags?.length
                    ? r.tags
                    : [r.cuisineType, r.dishType].filter(Boolean);
                  return (
                  <tr key={r._id}>
                    <td className="recipe-name-cell">{r.name}</td>
                    <td>
                      {tags.length ? (
                        <div className="tr-tags-cell">
                          {tags.map((t, i) => (
                            <span key={i} className="tr-tag-chip">{t}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className="muted">
                      {r.readyInMinutes ? `${r.readyInMinutes} min` : "—"}
                    </td>
                    <td className="muted">{timeAgo(r.createdAt)}</td>
                    <td className="actions-cell">
                      <button
                        className="action-btn view"
                        onClick={() => setSelectedRecipe(r)}
                      >
                        View
                      </button>
                      <button
                        className="action-btn danger"
                        onClick={() =>
                          setPendingAction({
                            title: "Delete Team Recipe",
                            message: (
                              <>
                                Permanently delete <strong>{r.name}</strong>? It
                                will be removed from the home page.
                              </>
                            ),
                            confirmLabel: "Delete",
                            onConfirm: () => deleteTeamRecipe(r._id),
                          })
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRecipe && (
        <TeamRecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}
