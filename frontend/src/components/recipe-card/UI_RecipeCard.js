import "./UI_RecipeCard.css";
import "pages/page-css/Home.css";
import Icon_timer from "assets/icons/icon-timer-red.svg";
import Icon_heart_empty from "assets/icons/icon-heart-empty-red.svg";
import Icon_heart_filled from "assets/icons/icon-heart-filled-red.svg";
import Image_placeholderFood from "assets/images/image-placeholder-food.png";

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
}) {
  const categories = [cuisineType, dishType].filter(Boolean);

  return (
    <div className="recipe-card-container" onClick={onClick}>
      <div className="recipe-image">
        <img src={image || Image_placeholderFood} alt={title || "Dish"} />

        {!hideHeart && (
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