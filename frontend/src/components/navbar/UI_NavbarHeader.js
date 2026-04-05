import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import "./UI_NavbarHeader.css";
import logo from "assets/logo/logo-noslogan.png";

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
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleLogout() {
    logout();
    navigate("/home");
  }

  return (
    <div className={`navbarHeader-container${hasBg ? " scrolled" : ""}${showNav ? " show-nav" : ""}`}>
      <div className="logo" onClick={() => navigate("/home")}>
        <img src={logo} alt="YumMeal logo" />
      </div>

      <nav className="header-nav">
        <NavLink to="/home" className={({ isActive }) => isActive ? "selected" : ""}>Home</NavLink>
        <NavLink to="/find-recipes" className={({ isActive }) => isActive ? "selected" : ""}>Find Recipes</NavLink>
        <NavLink to="/pantry" className={({ isActive }) => isActive ? "selected" : ""}>Favourite Recipes</NavLink>
        <NavLink to="/saved-recipes" className={({ isActive }) => isActive ? "selected" : ""}>Add Your Recipes</NavLink>
        <NavLink to="/meal-plan" className={({ isActive }) => isActive ? "selected" : ""}>Your Meal Plan</NavLink>
      </nav>

      <div className="rightside">

        {!user ? (
          <>
            <button
              className="outlined-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

            <button
              className="filled-btn"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            <button
              className="outlined-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
            
            <button
              className="filled-btn"
              onClick={() => navigate("/profile")}
            >
              My Profile
            </button>


          </>
        )}

      </div>
    </div>
  );
}

export default UI_NavbarHeader;