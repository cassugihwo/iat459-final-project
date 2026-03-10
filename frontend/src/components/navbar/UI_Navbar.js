import { useNavigate } from "react-router-dom";
import "./UI_Navbar.css";

function UI_Navbar() {
  const navigate = useNavigate();

  return (
    <div className="navbar-container">
      <ul>
        <li>
          <a className="selected" onClick={() => navigate("/home")}>
            Home
          </a>
        </li>
        <li>
          <a onClick={() => navigate("/find-recipes")}>
            Find Recipes
          </a>
        </li>
        <li>
          <a onClick={() => navigate("/pantry")}>
            Your Pantry
          </a>
        </li>
        <li>
          <a onClick={() => navigate("/saved-recipes")}>
            Your Recipe List
          </a>
        </li>
        <li>
          <a onClick={() => navigate("/meal-plan")}>
            Your Meal Plan
          </a>
        </li>
      </ul>
    </div>
  );
}

export default UI_Navbar;