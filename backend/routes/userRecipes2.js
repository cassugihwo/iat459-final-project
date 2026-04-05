const express = require("express");
const router = express.Router();
const UserRecipe2 = require("../models/UserRecipe2");
const verifyToken = require("../middleware/authMiddleWare");

// GET all recipes for logged-in user only
router.get("/", verifyToken, async (req, res) => {
  try {
    const userRecipes = await UserRecipe2.find({ owner: req.userId }).sort({
      createdAt: -1,
    });
    res.json(userRecipes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET personalized recipes
router.get("/my-recipes", verifyToken, async (req, res) => {
  try {
    const userRecipes = await UserRecipe2.find({ owner: req.userId }).sort({
      createdAt: -1,
    });
    res.json(userRecipes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST recipe for logged-in user only
router.post("/", verifyToken, async (req, res) => {
  try {
    const userRecipe = new UserRecipe2({
      name: req.body.name,
      image: req.body.image,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      owner: req.userId,
    });

    await userRecipe.save();
    res.status(201).json(userRecipe);
  } catch (err) {
    res.status(400).json({ message: "Error saving recipe", error: err.message });
  }
});

// DELETE route, only owner can delete
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userRecipe = await UserRecipe2.findById(req.params.id);

    if (!userRecipe) {
      return res.status(404).json({ message: "UserRecipe not found" });
    }

    if (userRecipe.owner.toString() !== req.userId) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to delete this recipe.",
      });
    }

    await UserRecipe.findByIdAndDelete(req.params.id);
    res.json({ message: "UserRecipe successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;