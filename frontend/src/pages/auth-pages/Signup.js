import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "services/authService";
import "./AuthPages.css";

function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      await registerUser(formData);
      navigate("/login");
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
        <h2>Create Account</h2>
        <p>
          Already have an account? <Link to="/login">Click here to login</Link>
        </p>

        <form onSubmit={handleSubmit}>
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />

          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />

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

          <button type="submit">Create YumMeal Account</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;