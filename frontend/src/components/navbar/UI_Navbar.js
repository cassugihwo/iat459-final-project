import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import "./UI_Navbar.css";

const PROTECTED = [
  { to: "/pantry", label: "Favourite Recipes" },
  { to: "/saved-recipes", label: "Add Your Recipes" },
  { to: "/meal-plan", label: "Your Meal Plan" },
];

const PUBLIC = [
  { to: "/home", label: "Home" },
  { to: "/find-recipes", label: "Find Recipes" },
];

function UI_Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  function handleProtectedClick(event) {
    if (!user) {
      event.preventDefault();
      navigate("/login");
    }
  }

  return (
    <div className="navbar-container">
      <ul>
        {PUBLIC.map(({ to, label }) => (
          <li key={to}>
            <NavLink to={to} className={({ isActive }) => (isActive ? "selected" : "")}>
              {label}
            </NavLink>
          </li>
        ))}

        {PROTECTED.map(({ to, label }) => (
          <li key={to} className={!user ? "nav-protected" : ""}>
            <NavLink
              to={to}
              className={({ isActive }) => (isActive ? "selected" : "")}
              onClick={handleProtectedClick}
            >
              {label}
            </NavLink>
            {!user && <span className="nav-tooltip">Login to access this feature</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UI_Navbar;
