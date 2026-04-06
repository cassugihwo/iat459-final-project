import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import logo from "assets/logo/logo-noslogan-light.png";
import "remixicon/fonts/remixicon.css";
import "./UI_Footer.css";

//Protected routes that require login to access
const PROTECTED = [
  "/pantry",
  "/saved-recipes",
  "/meal-plan",
  "/profile",
  "/settings",
];

// Reusable component for footer links that handles protected routes
function FooterLink({ to, children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isProtected = PROTECTED.includes(to);

  if (isProtected && !user) {
    return (
      <li className="footer-protected">
        <span onClick={() => navigate("/login")}>{children}</span>
        <span className="footer-tooltip">Login to access this feature</span>
      </li>
    );
  }
  return (
    <li>
      <NavLink to={to}>{children}</NavLink>
    </li>
  );
}

function UI_Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src={logo} alt="YumMeal" className="footer-logo" />
          <p className="footer-tagline">
            Find your next Yum. Discover recipes, plan your meals, and cook with
            confidence.
          </p>
          {/* Social media links */}
          <div className="footer-socials">
            <span className="social-icon" aria-label="Facebook">
              <i className="ri-facebook-fill"></i>
            </span>
            <span className="social-icon" aria-label="Instagram">
              <i className="ri-instagram-line"></i>
            </span>
            <span className="social-icon" aria-label="LinkedIn">
              <i className="ri-linkedin-fill"></i>
            </span>
          </div>
        </div>

        {/*Explore and Protected links */}
        <div className="footer-col">
          <h4 className="footer-col-title">Explore</h4>
          <ul>
            <FooterLink to="/find-recipes">Find Recipes</FooterLink>
            <FooterLink to="/pantry">Favourite Recipes</FooterLink>
            <FooterLink to="/saved-recipes">Add Your Recipe</FooterLink>
            <FooterLink to="/meal-plan">Your Meal Plan</FooterLink>
          </ul>
        </div>

        {/* Account and Favourite links */}
        <div className="footer-col">
          <h4 className="footer-col-title">Account</h4>
          <ul>
            <FooterLink to="/profile">My Profile</FooterLink>
            <FooterLink to="/pantry">Your Pantry</FooterLink>
            <li>
              <NavLink to="/login">Login / Sign Up</NavLink>
            </li>
          </ul>
        </div>

        {/* Company links (place holder)*/}
        <div className="footer-col">
          <h4 className="footer-col-title">Company</h4>
          <ul>
            <li>
              <span>About Us</span>
            </li>
            <li>
              <span>Contact</span>
            </li>
            <li>
              <span>Privacy Policy</span>
            </li>
            <li>
              <span>Terms of Use</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer bottom with copyright and legal links (placeholder)*/}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} YumMeal. All rights reserved.</p>
        <div className="footer-bottom-links">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Cookies</span>
        </div>
      </div>
    </footer>
  );
}

export default UI_Footer;
