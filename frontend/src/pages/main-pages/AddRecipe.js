import { useContext, useEffect, useState } from "react";
import "pages/MainPage.css";
import { AuthContext } from "context/AuthContext";

function FindRecipes(props) {
  const [userRecipes, setUserRecipes] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    ingredients: "",
    instructions: "",
  });

  const { token, user, logout } = useContext(AuthContext);

  useEffect(() => {
    fetch("http://localhost:5001/api/user-recipes")
      .then((res) => res.json())
      .then((data) => setUserRecipes(data))
      .catch((err) => console.error("Error fetching recipes:", err));
  }, []);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  // creating data: protected POST request
  async function handleSubmit(e) {
    e.preventDefault(); // stop the page from refreshing

    try {
      const response = await fetch("http://localhost:5001/api/user-recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // attach the token to prove user is authorized
          Authorization: token,
        },
        body: JSON.stringify(formData), // send the form data to the server
      });

      // basic error handling if the token is invalid/missing or the server rejects
      if (!response.ok) {
        throw new Error("Failed to add recipe. Are you authorized?");
      }

      // if successful, the server sends back the newly created plant (including its new MongoDB _id)
      const newUserRecipe = await response.json();

      // update our local React state to include the new plant instantly without refreshing the page
      setUserRecipes([...userRecipes, newUserRecipe]);

      // clear the form fields
      setFormData({
        name: "",
        ingredients: "",
        instructions: "",
      });
    } catch (err) {
        console.log("Failed form submit");
      console.error(err);
      alert(err.message); // show the error to the user
    }
  }

  // deleting data: protected DELETE request
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-recipes/${id}`, {
        method: "DELETE",
        headers: {
          // attach the token to prove user is authorized - again
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete. Are you authorized?");
      }

      // if the backend successfully deleted it, remove it from our local React state
      // this filters out the deleted plant so it disappears from the screen instantly
      setUserRecipes(userRecipes.filter((recipe) => recipe._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="placeholderpage">
      <h1>Recipes</h1>
      <h2>Add a recipe</h2>
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <label>Recipe Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Ingredients</label>
          <input
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
          />

          <label>Instructions</label>
          <input
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
          />

          <button type="submit">Add Recipe</button>
        </form>
      </div>

      <h2>Your Recipes</h2>
      <div className="recipe-list">
        {userRecipes.map((recipe) => (
          <div className="recipe-card">
            <h3>{recipe.name}</h3>
            <p>{recipe.ingredients}</p>
            <p>{recipe.instructions}</p>
          </div>
        ))}
      </div>
    </div>
  );


}

export default FindRecipes;
