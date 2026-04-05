import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "services/authService";
import "./AuthPages.css";
import logo from "assets/logo/logo-noslogan.png";

function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    agree: false,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!formData.agree) {
      setError("You must agree to the Terms of Service and Privacy Policy.");
      return;
    }
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      await registerUser(formData);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="bg-base"></div>
      <div className="bg-blob"></div>
      <div className="bg-emoji">🍅</div>
      <div className="bg-emoji-top">🍅</div>            
      <div className="auth-left">
        <img src={logo} alt="YumMeal logo" />
        <p className="introduce">Find your next Yum!</p>
        <ul>
          <li>Cook smarter, save more times</li>
          <li>Find recipes from your fridge</li>
          <li>Discover more meals</li>
          <li>Save unlimited favourites</li>
          <li>Add and save your own one</li>
        </ul>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <Link to="/login" className="auth-tab">
              Login
            </Link>
            <Link to="/signup" className="auth-tab active">
              Sign Up
            </Link>
          </div>

          <h2>Create Account</h2>
          <p className="auth-subtext">
            Already have an account?{" "}
            <Link to="/login" className="inline-link">
              Click here to login
            </Link>
          </p>

          <hr className="auth-divider" />

          <form onSubmit={handleSubmit}>
            <div className="name-row">
              <div className="field-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <label className="auth-checkbox">
              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
                required
              />
              <span>
                I agree to the{" "}
                <Link to="/terms" className="terms-link">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="terms-link">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {error && <p className="error-text">{error}</p>}

            <button type="submit">Log In To YumMeal</button>

            <p className="guest-text">
              Just Browsing?{" "}
              <Link to="/home" className="guest-link">
                Continue as a Guest
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;