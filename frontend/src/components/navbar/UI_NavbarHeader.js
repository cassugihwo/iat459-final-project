import { useEffect, useState } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import "./UI_NavbarHeader.css";
import logo from "assets/logo/logo-noslogan.png";

const PROTECTED = [
  { to: "/pantry", label: "Favourite Recipes" },
  { to: "/saved-recipes", label: "Add Your Recipes" },
  { to: "/meal-plan", label: "Your Meal Plan" },
];

function UI_NavbarHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [hasBg, setHasBg] = useState(false);
  const [showNav, setShowNav] = useState(false);

  function handleScroll() {
    setHasBg(window.scrollY > 10);
    const navEl = document.querySelector(".navbar");
    if (navEl) {
      const shouldHide = navEl.getBoundingClientRect().top < 70;
      setShowNav(shouldHide);
      navEl.classList.toggle("hidden", shouldHide);
    }
  }

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/home");
  }

  function handleProtectedClick(event) {
    if (!user) {
      event.preventDefault();
      navigate("/login");
    }
  }

  return (
    <div className={`navbarHeader-container${hasBg ? " scrolled" : ""}${showNav ? " show-nav" : ""}`}>
      <div className="logo" onClick={() => navigate("/home")}>
        <img src={logo} alt="YumMeal logo" />
      </div>

      <nav className="header-nav">
        <NavLink to="/home" className={({ isActive }) => isActive ? "selected" : ""}>Home</NavLink>
        <NavLink to="/find-recipes" className={({ isActive }) => isActive ? "selected" : ""}>Find Recipes</NavLink>

        {PROTECTED.map(({ to, label }) => (
          <span key={to} className={!user ? "nav-protected" : ""}>
            <NavLink
              to={to}
              className={({ isActive }) => isActive ? "selected" : ""}
              onClick={handleProtectedClick}
            >
              {label}
            </NavLink>
            {!user && <span className="nav-tooltip">Login to access this feature</span>}
          </span>
        ))}
      </nav>

      <div className="rightside">
        {!user ? (
          <>
            <button className="outlined-btn" onClick={() => navigate("/login")}>Login</button>
            <button className="filled-btn" onClick={() => navigate("/signup")}>Sign Up</button>
          </>
        ) : (
          <>
            <button className="outlined-btn" onClick={handleLogout}>Logout</button>
            <button className="filled-btn" onClick={() => navigate("/profile")}>My Profile</button>
          </>
        )}
      </div>
    </div>
  );
}

export default UI_NavbarHeader;
