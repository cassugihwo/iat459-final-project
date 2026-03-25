import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import "./UI_NavbarHeader.css";
import logo from "assets/logo/logo-noslogan.png";

function UI_NavbarHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/home");
  }

  return (
    <div className="navbarHeader-container">
      <div className="logo" onClick={() => navigate("/home")}>
        <img src={logo} alt="YumMeal logo" />
      </div>

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