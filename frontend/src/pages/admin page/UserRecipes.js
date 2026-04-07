import { timeAgo } from "./Utils";
import "./css/UserRecipes.css";

function parseRecipe(recipe) {
  const lines = (recipe.instructions || "").split("\n");
  const metaLine = lines[0] || "";
  const servesMatch = metaLine.match(/Serves:\s*(\d+)/);
  const cookMatch = metaLine.match(/Cook:\s*(\d+)\s*min/);
  const tagMatch = metaLine.match(/Tags:\s*([^|]+)/);
  const serves = servesMatch ? servesMatch[1] : null;
  const cookTime = cookMatch ? cookMatch[1] : null;
  const tags = tagMatch
    ? tagMatch[1]
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];
  const steps = lines
    .slice(2)
    .map((l) => l.trim())
    .filter(Boolean);
  const ingredients = (recipe.ingredients || "")
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);
  return { serves, cookTime, tags, steps, ingredients };
}

function RecipeDetailModal({ recipe, onClose }) {
  const parsed = parseRecipe(recipe);
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
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">{recipe.name}</h2>
          <button className="admin-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.name}
            className="admin-modal-img"
          />
        ) : (
          <div className="admin-modal-img-placeholder">
            <span>No image</span>
          </div>
        )}

        <div className="admin-modal-meta">
          <span className={`badge ${recipe.isPublic ? "active" : "suspended"}`}>
            {recipe.isPublic ? "Public" : "Private"}
          </span>
          {parsed.serves && (
            <span className="admin-modal-chip">Serves {parsed.serves}</span>
          )}
          {parsed.cookTime && (
            <span className="admin-modal-chip">{parsed.cookTime} min</span>
          )}
          {parsed.tags.map((t) => (
            <span key={t} className="admin-modal-chip">
              {t}
            </span>
          ))}
        </div>

        <div className="admin-modal-owner">
          <strong>@{recipe.owner?.username || "unknown"}</strong>
          <span className="muted"> · {createdDate}</span>
        </div>

        <div className="admin-modal-body">
          <div className="admin-modal-section">
            <h3>Ingredients</h3>
            <ul className="admin-modal-list">
              {parsed.ingredients.length === 0 ? (
                <li className="muted">No ingredients listed.</li>
              ) : (
                parsed.ingredients.map((ing, i) => <li key={i}>{ing}</li>)
              )}
            </ul>
          </div>

          <div className="admin-modal-section">
            <h3>Instructions</h3>
            {parsed.steps.length === 0 ? (
              <p className="muted">No instructions provided.</p>
            ) : (
              parsed.steps.map((step, i) => (
                <div key={i} className="admin-modal-step">
                  <span className="admin-modal-step-num">{i + 1}</span>
                  <p>{step}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecipeTable({
  recipes,
  setPendingAction,
  deleteRecipe,
  setSelectedRecipe,
}) {
  return (
    <table className="admin-table recipes-table">
      <colgroup>
        <col className="ur-col-recipe" />
        <col className="ur-col-owner" />
        <col className="ur-col-submitted" />
        <col className="ur-col-actions" />
      </colgroup>
      <thead>
        <tr>
          <th>Recipe</th>
          <th>Owner</th>
          <th>Submitted</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {recipes.length === 0 ? (
          <tr>
            <td colSpan={4} className="empty-row">
              No recipes found
            </td>
          </tr>
        ) : (
          recipes.map((r) => (
            <tr key={r._id}>
              <td className="recipe-name-cell">{r.name}</td>
              <td>@{r.owner?.username || "unknown"}</td>
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
                      title: "Delete Recipe",
                      message: (
                        <>
                          Are you sure you want to delete{" "}
                          <strong>{r.name}</strong>? This cannot be undone.
                        </>
                      ),
                      confirmLabel: "Delete",
                      onConfirm: () => deleteRecipe(r._id),
                    })
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default function AdminRecipes({
  filteredRecipes,
  setPendingAction,
  deleteRecipe,
  selectedRecipe,
  setSelectedRecipe,
}) {
  const publicRecipes = filteredRecipes.filter((r) => r.isPublic);
  const privateRecipes = filteredRecipes.filter((r) => !r.isPublic);

  return (
    <>
      <div className="recipes-sections">
        <div className="admin-panel full">
          <div className="recipes-section-header">
            <span className="recipes-section-title">
              Public Recipes From Users
            </span>
          </div>
          <RecipeTable
            recipes={publicRecipes}
            setPendingAction={setPendingAction}
            deleteRecipe={deleteRecipe}
            setSelectedRecipe={setSelectedRecipe}
          />
        </div>

        <div className="admin-panel full">
          <div className="recipes-section-header">
            <span className="recipes-section-title">
              Private Recipes From Users
            </span>
          </div>
          <RecipeTable
            recipes={privateRecipes}
            setPendingAction={setPendingAction}
            deleteRecipe={deleteRecipe}
            setSelectedRecipe={setSelectedRecipe}
          />
        </div>
      </div>

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </>
  );
}
