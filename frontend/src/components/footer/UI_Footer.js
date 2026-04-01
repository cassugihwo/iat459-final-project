import { NavLink } from "react-router-dom";
import logo from "assets/logo/logo-noslogan-light.png";
import "./UI_Footer.css";

function UI_Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-brand">
          <img src={logo} alt="YumMeal" className="footer-logo" />
          <p className="footer-tagline">
            Find your next Yum. Discover recipes, plan your meals, and cook with confidence.
          </p>
          <div className="footer-socials">
            <span className="social-icon" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </span>
            <span className="social-icon" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </span>
            <span className="social-icon" aria-label="YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
            </span>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Explore</h4>
          <ul>
            <li><NavLink to="/find-recipes">Find Recipes</NavLink></li>
            <li><NavLink to="/pantry">Favourite Recipes</NavLink></li>
            <li><NavLink to="/saved-recipes">Add Your Recipe</NavLink></li>
            <li><NavLink to="/meal-plan">Your Meal Plan</NavLink></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Account</h4>
          <ul>
            <li><NavLink to="/profile">My Profile</NavLink></li>
            <li><NavLink to="/pantry">Your Pantry</NavLink></li>
            <li><NavLink to="/settings">Settings</NavLink></li>
            <li><NavLink to="/login">Login / Sign Up</NavLink></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Company</h4>
          <ul>
            <li><span>About Us</span></li>
            <li><span>Contact</span></li>
            <li><span>Privacy Policy</span></li>
            <li><span>Terms of Use</span></li>
          </ul>
        </div>

      </div>

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
