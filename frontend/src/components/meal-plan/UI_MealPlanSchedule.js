import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import "./UI_MealPlan.css";
import "pages/MainPage.css";
import { Trash2, ChevronUp, ChevronDown, Plus } from "lucide-react";
import Icon_timer from "assets/icons/icon-timer-red.svg";
import Logo from "assets/logo/logo-full.png";
import UIMealPlanModal from "./UI_MealPlanModal";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function buildRecipeLookupKey(recipe) {
  return [
    recipe?.title || "",
    recipe?.image || "",
    recipe?.cuisineType || "",
    recipe?.dishType || "",
    recipe?.readyInMinutes || "",
    recipe?.isUserRecipe ? "user" : "favourite",
  ].join("|");
}

function UI_MealPlanSchedule({ plan, onSave }) {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [localPlan, setLocalPlan] = useState(null);
  const [planTitle, setPlanTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDay, setModalDay] = useState(null);
  const [recipePaths, setRecipePaths] = useState({});

  // Sync local state when the plan prop changes (e.g. after a save or plan switch)
  useEffect(() => {
    if (plan) {
      setLocalPlan(JSON.parse(JSON.stringify(plan)));
      setPlanTitle(plan.title || "");
      setEditMode(false);
    }
  }, [plan]);

  useEffect(() => {
    if (!token) {
      setRecipePaths({});
      return;
    }

    let isActive = true;

    async function fetchRecipePaths() {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [favRes, createdRes] = await Promise.all([
          fetch("http://localhost:5001/api/favourites", { headers }),
          fetch("http://localhost:5001/api/user-recipes2", { headers }),
        ]);

        if (!favRes.ok || !createdRes.ok) {
          if (isActive) setRecipePaths({});
          return;
        }

        const [favourites, createdRecipes] = await Promise.all([
          favRes.json(),
          createdRes.json(),
        ]);

        if (!isActive) return;

        const nextPaths = {};

        for (const favourite of Array.isArray(favourites) ? favourites : []) {
          nextPaths[
            buildRecipeLookupKey({
              recipeId: favourite.recipeId,
              title: favourite.title,
              image: favourite.image,
              cuisineType: favourite.cuisineType,
              dishType: favourite.dishType,
              readyInMinutes: favourite.readyInMinutes,
              isUserRecipe: false,
            })
          ] = `/recipe/${favourite.recipeId}`;
        }

        for (const recipe of Array.isArray(createdRecipes) ? createdRecipes : []) {
          nextPaths[
            buildRecipeLookupKey({
              recipeId: recipe._id,
              title: recipe.name,
              image: recipe.image,
              dishType: recipe.isPublic ? "Public" : "Private",
              isUserRecipe: true,
            })
          ] = `/my-recipe/${recipe._id}`;
        }

        setRecipePaths(nextPaths);
      } catch {
        if (isActive) setRecipePaths({});
      }
    }

    fetchRecipePaths();

    return () => {
      isActive = false;
    };
  }, [token]);

  if (!localPlan) return null;

  function getDayRecipes(day) {
    const entry = localPlan.plan.find((d) => d.day === day);
    return entry ? entry.recipes || [] : [];
  }

  function updateDayRecipes(day, recipes) {
    setLocalPlan((prev) => ({
      ...prev,
      plan: prev.plan.map((d) => (d.day === day ? { ...d, recipes } : d)),
    }));
  }

  function handleRemoveRecipe(day, idx) {
    updateDayRecipes(
      day,
      getDayRecipes(day).filter((_, i) => i !== idx),
    );
  }

  function handleMoveRecipe(day, idx, direction) {
    const recipes = [...getDayRecipes(day)];
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= recipes.length) return;
    [recipes[idx], recipes[newIdx]] = [recipes[newIdx], recipes[idx]];
    updateDayRecipes(day, recipes);
  }

  function handleAddRecipe(recipeSnap) {
    if (!modalDay) return;
    updateDayRecipes(modalDay, [...getDayRecipes(modalDay), recipeSnap]);
  }

  function handleFinishEditing() {
    onSave({ ...localPlan, title: planTitle });
    setEditMode(false);
  }

  function handleCancelEditing() {
    setLocalPlan(JSON.parse(JSON.stringify(plan)));
    setPlanTitle(plan.title || "");
    setEditMode(false);
  }

  function getRecipeDetailPath(recipe) {
    if (recipe?.recipeId) {
      return recipe.isUserRecipe
        ? `/my-recipe/${recipe.recipeId}`
        : `/recipe/${recipe.recipeId}`;
    }

    return recipePaths[buildRecipeLookupKey(recipe)] || null;
  }

  function RecipeCardRow({ recipe, idx, day }) {
    const categories = [recipe.cuisineType, recipe.dishType].filter(Boolean);
    const detailPath = getRecipeDetailPath(recipe);
    const isClickable = !editMode && Boolean(detailPath);

    function handleOpenRecipe() {
      if (detailPath) {
        navigate(detailPath);
      }
    }

    return (
      <div className={`mps-day-recipe-card-wrapper-inner ${editMode ? "editing" : ""}`}>
        {editMode && (
          <div className="mps-reorder-controls" aria-label="Reorder recipes">
            <button
              type="button"
              className="mps-reorder-btn"
              aria-label="Move recipe up"
              onClick={() => handleMoveRecipe(day, idx, -1)}
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              className="mps-reorder-btn"
              aria-label="Move recipe down"
              onClick={() => handleMoveRecipe(day, idx, 1)}
            >
              <ChevronDown size={16} />
            </button>
          </div>
        )}
        <div
          className={`mps-recipe-card-container${isClickable ? " mps-recipe-card-container-clickable" : ""}`}
          onClick={isClickable ? handleOpenRecipe : undefined}
          onKeyDown={
            isClickable
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleOpenRecipe();
                  }
                }
              : undefined
          }
          role={isClickable ? "button" : undefined}
          tabIndex={isClickable ? 0 : undefined}
          aria-label={isClickable ? `Open ${recipe.title || "recipe"}` : undefined}
        >
          <div className="mps-recipe-image">
            {recipe.image ? (
              <img src={recipe.image} alt={recipe.title || "Dish"} />
            ) : (
              <div className="mps-recipe-image-placeholder">
                <img src={Logo} alt="YumMeal" />
              </div>
            )}
          </div>

          {editMode && (
            <div className="mps-recipe-del-wrapper">
              <button
                className="mps-recipe-del-btn"
                onClick={() => handleRemoveRecipe(day, idx)}
                aria-label="Remove from Meal Plan"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}

          <div className="mps-recipe-desc">
            {categories.length > 0 && (
              <p className="mps-recipe-categories">
                {categories.join(" · ").toUpperCase()}
              </p>
            )}
            <h4>{recipe.title || "Dish Name"}</h4>
            <div className="mps-recipe-meta-row">
              <div className="mps-time">
                <img
                  className="mps-icon-cooktime"
                  src={Icon_timer}
                  aria-hidden="true"
                  alt=""
                />
                <span>
                  {recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderDay(day) {
    const recipes = getDayRecipes(day);
    return (
      <div className="mps-day" id={day} key={day}>
        <div className="mps-day-header">
          <h4>{day}</h4>
        </div>
        <div className="mps-day-body">
          <div
            className={`mps-day-recipe-card-wrapper${editMode ? " mps-day-recipe-card-wrapper-editing" : ""}`}
          >
            {recipes.map((recipe, idx) => (
              <RecipeCardRow
                key={`${day}-${idx}`}
                recipe={recipe}
                idx={idx}
                day={day}
              />
            ))}

            {recipes.length === 0 && !editMode && (
              <p className="mps-day-empty">—</p>
            )}

            {editMode && (
              <div className="mps-add-recipe" aria-label="Add recipes">
                <button
                  type="button"
                  className="mps-add-recipe-btn"
                  aria-label={`Add recipe to ${day}`}
                  onClick={() => {
                    setModalDay(day);
                    setIsModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mps-plan-header">
        {editMode ? (
          <input
            className="mps-plan-title-input"
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
            placeholder="Plan name"
            aria-label="Plan name"
          />
        ) : (
          <h4>{planTitle || "Untitled Plan"}</h4>
        )}
        <button
          className={`mps-edit-btn${editMode ? " mps-edit-btn-finish" : ""}`}
          onClick={() => (editMode ? handleFinishEditing() : setEditMode(true))}
        >
          {editMode ? "Save" : "Edit Schedule"}
        </button>
        {editMode && (
          <button
            className="mps-edit-btn mps-cancel-btn"
            onClick={handleCancelEditing}
          >
            Cancel
          </button>
        )}
      </div>

      <div className="mps-wrapper">
        <div className="mps-container">{DAYS.map(renderDay)}</div>
      </div>

      <UIMealPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(recipe) => {
          handleAddRecipe(recipe);
          setIsModalOpen(false);
        }}
        day={modalDay}
      />
    </div>
  );
}

export default UI_MealPlanSchedule;
