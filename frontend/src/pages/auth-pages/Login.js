import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { loginUser } from "services/authService";
import { useAuth } from "context/AuthContext";
import Toast from "components/toast/UI_Toast";
import "./AuthPages.css";
import logo from "assets/logo/logo-noslogan.png";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const data = await loginUser(formData);
      login(data.token);
      const decoded = jwtDecode(data.token);
      navigate(decoded.role === "admin" ? "/admin" : "/home");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <Toast message={error} onClose={() => setError("")} />
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
            <Link to="/login" className="auth-tab active">
              Login
            </Link>
            <Link to="/signup" className="auth-tab">
              Sign Up
            </Link>
          </div>

          <h2>Welcome</h2>
          <p className="auth-subtext">
            New here?{" "}
            <Link to="/signup" className="inline-link">
              Click here to create account
            </Link>
          </p>

          <hr className="auth-divider" />

          <form onSubmit={handleSubmit}>
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

            <div className="auth-options">
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password
              </Link>
            </div>

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

export default Login;