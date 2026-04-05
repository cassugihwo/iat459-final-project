import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import logo from "assets/logo/logo-noslogan-light.png";
import "./UI_Footer.css";

const PROTECTED = ["/pantry", "/saved-recipes", "/meal-plan", "/profile", "/settings"];

function FooterLink({ to, children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isProtected = PROTECTED.includes(to);

  if (isProtected && !user) {
    return (
      <li className="footer-protected">
        <span onClick={() => navigate("/login")}>{children}</span>
        <span className="footer-tooltip">Login required</span>
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
            Find your next Yum. Discover recipes, plan your meals, and cook with confidence.
          </p>
          <div className="footer-socials">
            <span className="social-icon" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </span>
            <span className="social-icon" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </span>
            <span className="social-icon" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </span>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Explore</h4>
          <ul>
            <FooterLink to="/find-recipes">Find Recipes</FooterLink>
            <FooterLink to="/pantry">Favourite Recipes</FooterLink>
            <FooterLink to="/saved-recipes">Add Your Recipe</FooterLink>
            <FooterLink to="/meal-plan">Your Meal Plan</FooterLink>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Account</h4>
          <ul>
            <FooterLink to="/profile">My Profile</FooterLink>
            <FooterLink to="/pantry">Your Pantry</FooterLink>
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
