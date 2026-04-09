import { Trash2 } from "lucide-react";
import "./UI_MealPlan.css";
import "pages/MainPage.css";

function UI_MealPlanCard({ plan, isSelected, onClick, onDelete }) {
  const recipeCount = Array.isArray(plan?.plan)
    ? plan.plan.reduce(
        (total, dayEntry) => total + (Array.isArray(dayEntry?.recipes) ? dayEntry.recipes.length : 0),
        0,
      )
    : 0;

  return (
    <div
      className={`mps-schedule-card-container${isSelected ? " mps-schedule-card-selected" : ""}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Select ${plan?.title || "Untitled Plan"}`}
      aria-pressed={isSelected}
    >
      <h4 className="title">{plan?.title || "Untitled Plan"}</h4>
      <p className="mps-schedule-card-count">
        {recipeCount} {recipeCount === 1 ? "recipe saved" : "recipes saved"}
      </p>
      <button
        className="mps-schedule-card-del-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete meal plan"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export default UI_MealPlanCard;
