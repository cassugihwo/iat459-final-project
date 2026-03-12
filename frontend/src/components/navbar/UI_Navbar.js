import { NavLink } from "react-router-dom";
import "./UI_Navbar.css";

function UI_Navbar() {
  return (
    <div className="navbar-container">
      <ul>
        <li>
          <NavLink
            to="/home"
            className={({ isActive }) => (isActive ? "selected" : "")}
          >
            Home
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/find-recipes"
            className={({ isActive }) => (isActive ? "selected" : "")}
          >
            Find Recipes
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/pantry"
            className={({ isActive }) => (isActive ? "selected" : "")}
          >
            Favourite Recipes
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/saved-recipes"
            className={({ isActive }) => (isActive ? "selected" : "")}
          >
            Add Your Recipes
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/meal-plan"
            className={({ isActive }) => (isActive ? "selected" : "")}
          >
            Your Meal Plan
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default UI_Navbar;