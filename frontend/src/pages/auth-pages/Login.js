import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "services/authService";
import { useAuth } from "context/AuthContext";
import "./AuthPages.css";

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
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1>YumMeal</h1>
        <p>Find your next Yum!</p>
        <ul>
          <li>Cook smarter, save more time</li>
          <li>Find recipes from your fridge</li>
          <li>Discover more meals</li>
          <li>Save unlimited favourites</li>
          <li>Add and save your own one</li>
        </ul>
      </div>

      <div className="auth-card">
        <h2>Welcome</h2>
        <p>
          New here? <Link to="/signup">Click here to create account</Link>
        </p>

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          {error && <p>{error}</p>}

          <button type="submit">Log In To YumMeal</button>
        </form>
      </div>
    </div>
  );
}

export default Login;