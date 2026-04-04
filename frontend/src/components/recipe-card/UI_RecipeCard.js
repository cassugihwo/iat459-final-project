import "./UI_RecipeCard.css";
import "pages/page-css/Home.css";
import Icon_timer from "assets/icons/icon-timer-red.svg";
import Icon_heart_empty from "assets/icons/icon-heart-empty-red.svg";
import Icon_heart_filled from "assets/icons/icon-heart-filled-red.svg";
import Logo from "assets/logo/logo-full.png";

function UI_RecipeCard({
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
  isGuest = false,
  rating = null,
}) {
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

        <div className="recipe-rating-pill">
          <span className="recipe-rating-star">★</span>
          <span className="recipe-rating-value">{rating !== null && rating > 0 ? rating : "0"}</span>
        </div>

        {!hideHeart && (
          <div className={`recipe-fav-wrapper${isGuest ? " guest" : ""}`}>
            <button
              className={`recipe-fav-btn${isFavourited ? " favourited" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onFavourite && onFavourite();
              }}
              aria-label="Save as favourite"
            >
              <img
                src={isFavourited ? Icon_heart_filled : Icon_heart_empty}
                alt="Favourite"
              />
            </button>
            {isGuest && <span className="recipe-fav-tooltip">Login to save recipes</span>}
          </div>
        )}
      </div>

      <div className="recipe-desc">
        {categories.length > 0 && (
          <p className="recipe-categories">{categories.join(" · ").toUpperCase()}</p>
        )}
        <h3>{title || "Dish Name"}</h3>
        <div className="recipe-meta-row">
          <div className="time">
            <img className="icon-cooktime" src={Icon_timer} aria-hidden="true" alt="" />
            <span>{readyInMinutes ? `${readyInMinutes} min` : "20 min"}</span>
          </div>
          {difficulty && <span className="recipe-difficulty">{difficulty}</span>}
        </div>
      </div>
    </div>
  );
}

export default UI_RecipeCard;