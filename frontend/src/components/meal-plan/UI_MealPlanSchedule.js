import { useState } from "react";
import "./UI_MealPlan.css";
import "pages/MainPage.css";
import { Trash2, ChevronUp, ChevronDown } from "lucide-react";
import Icon_timer from "assets/icons/icon-timer-red.svg";
import Logo from "assets/logo/logo-full.png";
import UIMealPlanModal from "./UI_MealPlanModal";

function UI_MealPlanSchedule() {
  const [editSelectedSchedule, setEditSelectedSchedule] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function RecipeCard({
    title = "Dish Name",
    image,
    cuisineType,
    dishType,
    readyInMinutes,
    difficulty,
    onClick,
    usedIngredients,
    missedIngredients,
    rating = null,
  }) {
    
    const categories = [cuisineType, dishType].filter(Boolean);

    return (
      <div className="mps-recipe-card-container" onClick={onClick}>
        <div className="mps-recipe-image">
          {image ? (
            <img src={image} alt={title || "Dish"} />
          ) : (
            <div className="mps-recipe-image-placeholder">
              <img src={Logo} alt="YumMeal" />
            </div>
          )}

          {rating !== null && (
            <div className="mps-recipe-rating-pill">
              <span className="mps-recipe-rating-star">★</span>
              <span className="mps-recipe-rating-value">
                {rating > 0 ? rating : "0"}
              </span>
            </div>
          )}
        </div>

        {editSelectedSchedule && (
          <div className="mps-recipe-del-wrapper">
            <button
              className={`mps-recipe-del-btn`}
              onClick={(e) => {}}
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
          <h4>{title || "Dish Name"}</h4>
          <div className="mps-recipe-meta-row">
            <div className="mps-time">
              <img
                className="mps-icon-cooktime"
                src={Icon_timer}
                aria-hidden="true"
                alt=""
              />
              <span>{readyInMinutes ? `${readyInMinutes} min` : "20 min"}</span>
            </div>
            {difficulty && (
              <span className="mps-recipe-difficulty">{difficulty}</span>
            )}
          </div>

          {(usedIngredients?.length > 0 || missedIngredients?.length > 0) && (
            <ul className="mps-recipe-ingredients-list">
              {usedIngredients?.map((ing) => (
                <li key={ing} className="mps-ingredient-match">
                  <span className="mps-ingredient-icon">✓</span>
                  {ing}
                </li>
              ))}
              {missedIngredients?.map((ing) => (
                <li key={ing} className="mps-ingredient-miss">
                  <span className="mps-ingredient-icon">✕</span>
                  {ing}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  function MealPlanScheduleCard({ title = "Placeholder Meal Plan Title" }) {
    return (
      <div className="mps-mealplan-card">
        <h3>{title}</h3>
      </div>
    );
  }

  function renderDay(day) {
    return (
      <div className="mps-day" id={day}>
        <div className="mps-day-header">
          <h4>{day}</h4>
        </div>
        <div className="mps-day-body">
          <div
            className={`mps-day-recipe-card-wrapper${editSelectedSchedule ? " mps-day-recipe-card-wrapper-editing" : ""}`}
          >
            {editSelectedSchedule && (
              <div className="mps-reorder-controls" aria-label="Reorder recipes">
                <button
                  type="button"
                  className="mps-reorder-btn"
                  aria-label="Move recipe up"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  className="mps-reorder-btn"
                  aria-label="Move recipe down"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            )}
            <RecipeCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3>Test Meal Plan</h3>
      <button onClick={() => {
        setEditSelectedSchedule((prev) => !prev);
      }}>
        {editSelectedSchedule ? "Finish Editing" : "Edit Schedule"}
      </button>
      <button onClick={() => setIsModalOpen(true)}>Test Button</button>
      <div className="mps-wrapper">
        <div className="mps-container">
          {renderDay("Monday")}
          {renderDay("Tuesday")}
          {renderDay("Wednesday")}
          {renderDay("Thursday")}
          {renderDay("Friday")}
          {renderDay("Saturday")}
          {renderDay("Sunday")}
        </div>
      </div>
      <UIMealPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default UI_MealPlanSchedule;
