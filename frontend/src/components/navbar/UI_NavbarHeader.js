import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import "./UI_NavbarHeader.css";
import logo from "assets/logo/logo-noslogan.png";

const PUBLIC = [
  { to: "/home", label: "Home" },
  { to: "/find-recipes", label: "Find Recipes" },
];

const PROTECTED = [
  { to: "/pantry", label: "Favourite Recipes" },
  { to: "/saved-recipes", label: "Add Your Recipes" },
  { to: "/meal-plan", label: "Your Meal Plan" },
];

function UI_NavbarHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [hasBg, setHasBg] = useState(false);
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setHasBg(window.scrollY > 10);
      const navEl = document.querySelector(".navbar");
      if (navEl) {
        const shouldHide = navEl.getBoundingClientRect().top < 70;
        setShowNav(shouldHide);
        navEl.classList.toggle("hidden", shouldHide);
      } else {
        setShowNav(false);
      }
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleLogout() {
    logout();
    navigate("/home");
  }

  function handleProtectedClick(e) {
    if (!user) {
      e.preventDefault();
      navigate("/login");
    }
  }

  return (
    <div
      className={`navbarHeader-container${hasBg ? " scrolled" : ""}${showNav ? " show-nav" : ""}`}
    >
      <div className="logo" onClick={() => navigate("/home")}>
        <img src={logo} alt="YumMeal logo" />
      </div>

      <nav className="header-nav">
        {PUBLIC.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? "selected" : "")}
          >
            {label}
          </NavLink>
        ))}

        {PROTECTED.map(({ to, label }) => (
          <div key={to} className="header-nav-item">
            <NavLink
              to={to}
              className={({ isActive }) =>
                [isActive ? "selected" : "", !user ? "member-only-link" : ""]
                  .filter(Boolean)
                  .join(" ")
              }
              onClick={handleProtectedClick}
            >
              {label}
            </NavLink>
            {!user && (
              <span className="member-only-tooltip">
                Login to access this feature
              </span>
            )}
          </div>
        ))}
      </nav>

      <div className="rightside">
        {!user ? (
          <>
            <button className="outlined-btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="filled-btn" onClick={() => navigate("/signup")}>
              Sign Up
            </button>
          </>
        ) : (
          <>
            <button className="outlined-btn" onClick={handleLogout}>
              Logout
            </button>
            <button className="filled-btn" onClick={() => navigate("/profile")}>
              My Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default UI_NavbarHeader;
