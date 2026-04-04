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

router.get("/recipes/:id", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/${req.params.id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`
    );
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: "Spoonacular API error", details: data });
    }

    const detail = {
      id: data.id,
      title: data.title,
      image: data.image,
      readyInMinutes: data.readyInMinutes,
      servings: data.servings,
      dishTypes: data.dishTypes || [],
      cuisines: data.cuisines || [],
      diets: data.diets || [],
      ingredients: (data.extendedIngredients || []).map((ing) => ({
        id: ing.id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        original: ing.original,
      })),
      steps: data.analyzedInstructions?.[0]?.steps?.map((s) => ({
        number: s.number,
        step: s.step,
      })) || [],
    };

    res.json(detail);
  } catch (error) {
    console.error("Error fetching recipe detail:", error);
    res.status(500).json({ error: "Failed to fetch recipe detail", details: error.message });
  }
});

router.get("/find-by-ingredients", async (req, res) => {
  try {
    const { ingredients } = req.query;
    if (!ingredients) {
      return res.status(400).json({ error: "ingredients query param is required" });
    }

    const findRes = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=100&ranking=1&ignorePantry=true&apiKey=${process.env.SPOONACULAR_API_KEY}`
    );
    const findData = await findRes.json();
    if (!findRes.ok) {
      return res.status(findRes.status).json({ error: "Spoonacular API request failed", details: findData });
    }

    if (!findData.length) return res.json([]);

    const ids = findData.map((r) => r.id).join(",");
    const infoRes = await fetch(
      `https://api.spoonacular.com/recipes/informationBulk?ids=${ids}&apiKey=${process.env.SPOONACULAR_API_KEY}`
    );
    const infoData = await infoRes.json();

    const infoMap = {};
    if (infoRes.ok && Array.isArray(infoData)) {
      infoData.forEach((r) => { infoMap[r.id] = r; });
    }

    const cleaned = findData.map((recipe) => {
      const info = infoMap[recipe.id] || {};
      return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        usedIngredientCount: recipe.usedIngredientCount,
        missedIngredientCount: recipe.missedIngredientCount,
        readyInMinutes: info.readyInMinutes || null,
        cuisine: info.cuisines?.[0] || null,
        dietary: info.diets?.[0] || null,
        dishType: info.dishTypes?.[0] || null,
      };
    });

    res.json(cleaned);
  } catch (error) {
    console.error("Error fetching by ingredients:", error);
    res.status(500).json({ error: "Failed to fetch recipes by ingredients", details: error.message });
  }
});

module.exports = router;