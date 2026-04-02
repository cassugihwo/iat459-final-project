import { useContext, useEffect, useState } from "react";
import "pages/MainPage.css";
import { AuthContext } from "context/AuthContext";
import Navbar from "components/navbar/UI_Navbar";
import NavbarHeader from "components/navbar/UI_NavbarHeader";
import Footer from "components/footer/UI_Footer";
import logo from "assets/logo/logo-full.png";
import leftDish from "assets/bg image/left.png";
import centerDish from "assets/bg image/center.png";
import rightDish from "assets/bg image/right.png";

function SavedRecipes() {
  const [userRecipes, setUserRecipes] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    ingredients: "",
    instructions: "",
  });

  const { token } = useContext(AuthContext);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const response = await fetch("http://localhost:5001/api/user-recipes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recipes.");
        }

        const data = await response.json();
        setUserRecipes(data);
      } catch (err) {
        console.error("Error fetching recipes:", err);
      }
    }

    if (token) {
      fetchRecipes();
    }
  }, [token]);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/api/user-recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add recipe. Are you authorized?");
      }

      const newUserRecipe = await response.json();

      setUserRecipes((prevRecipes) => [...prevRecipes, newUserRecipe]);

      setFormData({
        name: "",
        ingredients: "",
        instructions: "",
      });
    } catch (err) {
      console.error("Failed form submit:", err);
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(
        `http://localhost:5001/api/user-recipes/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete. Are you authorized?");
      }

      setUserRecipes((prevRecipes) =>
        prevRecipes.filter((recipe) => recipe._id !== id)
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
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
              <h1>Recipes</h1>
              <p>Add and manage your recipes here.</p>
            </div>
          </div>

          <div className="placeholderpage">
            <h2>Add a Recipe</h2>

            <div className="form-container">
              <form onSubmit={handleSubmit}>
                <label htmlFor="name">Recipe Name</label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="ingredients">Ingredients</label>
                <input
                  id="ingredients"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="instructions">Instructions</label>
                <input
                  id="instructions"
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  required
                />

                <button type="submit">Add Recipe</button>
              </form>
            </div>

            <h2>Your Recipes</h2>

            <div className="recipe-list">
              {userRecipes.length > 0 ? (
                userRecipes.map((recipe) => (
                  <div key={recipe._id} className="recipe-card">
                    <h3>{recipe.name}</h3>
                    <p>
                      <strong>Ingredients:</strong> {recipe.ingredients}
                    </p>
                    <p>
                      <strong>Instructions:</strong> {recipe.instructions}
                    </p>
                    <button onClick={() => handleDelete(recipe._id)}>
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p>No recipes yet.</p>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default SavedRecipes;