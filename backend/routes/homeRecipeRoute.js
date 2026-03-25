const express = require("express");
const router = express.Router();

router.get("/home-recipes", async (req, res) => {
  try {
    console.log("GET /api/home-recipes was called");

    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?number=10&addRecipeInformation=true&apiKey=${process.env.SPOONACULAR_API_KEY}`
    );

    const contentType = response.headers.get("content-type");
    console.log("Spoonacular content-type:", contentType);

    const data = await response.json();

    if (!response.ok) {
      console.log("Spoonacular error:", data);
      return res.status(response.status).json({
        error: "Spoonacular API request failed",
        details: data,
      });
    }

    if (!data.results || !Array.isArray(data.results)) {
      return res.status(500).json({
        error: "Unexpected Spoonacular response",
        details: data,
      });
    }

    const cleanedRecipes = data.results.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes || 0,
      dishType: recipe.dishTypes?.[0] || "Main Course",
      cuisineType: recipe.cuisines?.[0] || "International",
    }));

    res.json(cleanedRecipes);
  } catch (error) {
    console.error("Error fetching Spoonacular recipes:", error);
    res.status(500).json({
      error: "Failed to fetch home recipes",
      details: error.message,
    });
  }
});

module.exports = router;