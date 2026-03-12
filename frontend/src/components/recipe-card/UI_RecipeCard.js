import "./UI_RecipeCard.css";
import Icon_timer from "assets/icons/icon-timer-red.svg";
import Image_placeholderFood from "assets/images/image-placeholder-food.png";


function UI_RecipeCard() {

    return (
      <div className="recipe-card-container">
        <div className="recipe-image">
          <img src={Image_placeholderFood} alt="Placeholder image for food" />
        </div>
        <div className="recipe-desc">
          <div className="title">
            <h3>Dish Name</h3>
            <ul>
              <li>Vietnamese</li>
              <li>Main</li>
              <li>Easy</li>
            </ul>
          </div>
          <div className="time">
            <img className="icon-cooktime" src={Icon_timer} aria-hidden="true" />
            <p>20 min</p>
          </div>
        </div>
      </div>
    );    
}

export default UI_RecipeCard;