import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import "./UI_Navbar.css";

function UI_Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  function handleMemberNavigation(path, featureName, event) {
    if (!user) {
      event.preventDefault();
      navigate("/member-only", {
        state: { featureName },
      });
    }
  }

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
            onClick={(event) =>
              handleMemberNavigation("/pantry", "Favourite Recipes", event)
            }
          >
            Favourite Recipes
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/saved-recipes"
            className={({ isActive }) => (isActive ? "selected" : "")}
            onClick={(event) =>
              handleMemberNavigation("/saved-recipes", "Add Your Recipes", event)
            }
          >
            Add Your Recipes
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/meal-plan"
            className={({ isActive }) => (isActive ? "selected" : "")}
            onClick={(event) =>
              handleMemberNavigation("/meal-plan", "Your Meal Plan", event)
            }
          >
            Your Meal Plan
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default UI_Navbar;