import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";
import RecipeCard from "components/recipe-card/UI_RecipeCard";
import "pages/MainPage.css";

function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="home-page">
      <div className="navbarHeader">
        <NavbarHeader />
      </div>

      <div className="bg">
        <div className="bg-food bg-food-left">
          <img src={leftDish} alt="Decorative dish" />
        </div>

        <div className="bg-food bg-food-center">
          <img src={centerDish} alt="Decorative dish" />
        </div>

        <div className="bg-food bg-food-right">
          <img src={rightDish} alt="Decorative dish" />
        </div>

        <div className="bg-logo">
          <img src={logo} alt="YumMeal Logo" />
        </div>

        <div className="bg-gradient"></div>
      </div>

      <div className="main">
        <div className="navbar">
          <Navbar />
        </div>

        <div className="main-content">
          <div className="header-container">
            <div className="header-container-wrapper">
              <h1>Welcome, {user?.username || "to YumMeal"}!</h1>
            </div>
          </div>

          <div>
            <RecipeCard/>
          </div>
          <p>placeholder text here</p>


          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
}

export default Home;