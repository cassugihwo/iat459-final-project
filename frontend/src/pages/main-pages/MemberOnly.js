import "pages/MainPage.css";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import Footer from "components/footer/UI_Footer";
import ScrollToTop from "components/scroll-to-top/UI_ScrollToTop";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";

function MemberOnly() {
  const navigate = useNavigate();
  const location = useLocation();

  const featureName = location.state?.featureName || "This feature";

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
          <div className="member-only-card">
            <h1>{featureName} is a member-only feature</h1>
            <p>
              Please sign up or log in to access favorites, meal planning,
              pantry tools, and other personalized features.
            </p>

            <div className="member-only-buttons">
              <button onClick={() => navigate("/login")}>Login</button>
              <button onClick={() => navigate("/signup")}>Sign Up</button>
            </div>
          </div>
        </div>
        <Footer />
        <ScrollToTop />
      </div>
    </div>
  );
}

export default MemberOnly;