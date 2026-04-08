import { Trash2 } from "lucide-react";
import "./UI_MealPlan.css";
import "pages/MainPage.css";

function UI_MealPlanCard({ plan, isSelected, onClick, onDelete }) {
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
      <h3 className="title">{plan?.title || "Untitled Plan"}</h3>
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
