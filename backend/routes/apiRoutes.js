require("dotenv").config();
const express = require("express");
const router = express.Router();

const apiKey = process.env.REACT_APP_API_KEY;

// Test route to verify Spoonacular API integration
router.get("/test", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/716429/information?apiKey=${apiKey}&includeNutrition=true`,
    );
    if (!response.ok) {
      throw new Error("/test: Failed to fetch from Spoonacular API");
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching from Spoonacular API:", err);
    res
      .status(500)
      .json({ error: "GYAHHH Failed to fetch from Spoonacular API" });
  }
});

module.exports = router;
