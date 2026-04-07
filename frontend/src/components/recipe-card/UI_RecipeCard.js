import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import "./UI_RecipeCard.css";
import "pages/page-css/Home.css";
import Icon_timer from "assets/icons/icon-timer-red.svg";
import Icon_heart_empty from "assets/icons/icon-heart-empty-red.svg";
import Icon_heart_filled from "assets/icons/icon-heart-filled-red.svg";
import Logo from "assets/logo/logo-full.png";

function UI_RecipeCard({
  // Recipe info
  title,
  image,
  cuisineType,
  dishType,
  readyInMinutes,
  difficulty,
  onFavourite,
  onClick,
  hideHeart = false,
  isFavourited = false,
  usedIngredients,
  missedIngredients,
  rating = null,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const categories = [cuisineType, dishType].filter(Boolean);

  return (
    <div className="recipe-card-container" onClick={onClick}>
      <div className="recipe-image">
        {image ? (
          <img src={image} alt={title || "Dish"} />
        ) : (
          <div className="recipe-image-placeholder">
            <img src={Logo} alt="YumMeal" />
          </div>
        )}

        {rating !== null && rating !== undefined && (
          <div className="recipe-rating-pill">
            <span className="recipe-rating-star">★</span>
            <span className="recipe-rating-value">{rating}</span>
          </div>
        )}
      </div>

      {!hideHeart && (
        <div className="recipe-fav-wrapper">
          <button
            className={`recipe-fav-btn${isFavourited ? " favourited" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                navigate("/login");
              } else {
                onFavourite && onFavourite();
              }
            }}
            aria-label="Save as favourite"
          >
            <img
              src={isFavourited ? Icon_heart_filled : Icon_heart_empty}
              alt="Favourite"
            />
          </button>
          {!user && (
            <span className="fav-tooltip">Login to save favourites</span>
          )}
        </div>
      )}

      <div className="recipe-desc">
        {categories.length > 0 && (
          <p className="recipe-categories">
            {categories.join(" · ").toUpperCase()}
          </p>
        )}
        <h3>{title || "Dish Name"}</h3>
        <div className="recipe-meta-row">
          <div className="time">
            <img
              className="icon-cooktime"
              src={Icon_timer}
              aria-hidden="true"
              alt=""
            />
            <span>{readyInMinutes ? `${readyInMinutes} min` : "20 min"}</span>
          </div>
          {difficulty && (
            <span className="recipe-difficulty">{difficulty}</span>
          )}
        </div>

        {(usedIngredients?.length > 0 || missedIngredients?.length > 0) && (
          <ul className="recipe-ingredients-list">
            {usedIngredients?.map((ing) => (
              <li key={ing} className="ingredient-match">
                <span className="ingredient-icon">✓</span>
                {ing}
              </li>
            ))}
            {missedIngredients?.map((ing) => (
              <li key={ing} className="ingredient-miss">
                <span className="ingredient-icon">✕</span>
                {ing}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default UI_RecipeCard;
