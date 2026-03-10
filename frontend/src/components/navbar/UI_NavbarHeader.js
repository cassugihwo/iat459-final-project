import { useNavigate } from "react-router-dom";
import "./UI_Navbar.css";
import logo from "assets/logo/logo-noslogan.png";

function UI_NavbarHeader() {
  const navigate = useNavigate();

  return (
    <div className="navbarHeader-container">
      <div className="logo">
        <img
          src={logo}
          alt="YumMeal logo"
          onClick={() => navigate("/home")}
          style={{ cursor: "pointer" }}
        />
      </div>

      <div className="rightside">
        <div className="buttons">
          <button
            className="buttonLogin"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="buttonSignup"
            onClick={() => navigate("/signup")}
          >
            Signup
          </button>
        </div>
      </div>
    </div>
  );
}

export default UI_NavbarHeader;