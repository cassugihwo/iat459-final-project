const express = require("express");
const router = express.Router();
const TeamRecipe = require("../models/TeamRecipe");
const verifyToken = require("../middleware/authMiddleWare");
const User = require("../models/User");

// Middleware: admin only
async function adminOnly(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("role");
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required." });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET all team recipes (public)
router.get("/", async (req, res) => {
  try {
    const recipes = await TeamRecipe.find()
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET a single team recipe by id (public)
router.get("/:id", async (req, res) => {
  try {
    const recipe = await TeamRecipe.findById(req.params.id).populate(
      "createdBy",
      "username",
    );
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST create a team recipe (admin only)
router.post("/", verifyToken, adminOnly, async (req, res) => {
  try {
    const {
      name,
      image,
      description,
      cuisineType,
      dishType,
      readyInMinutes,
      difficulty,
      ingredients,
      instructions,
    } = req.body;
    if (!name)
      return res.status(400).json({ message: "Recipe name is required." });

    const recipe = await TeamRecipe.create({
      name,
      image,
      description,
      cuisineType,
      dishType,
      readyInMinutes: readyInMinutes ? Number(readyInMinutes) : null,
      difficulty,
      ingredients,
      instructions,
      createdBy: req.userId,
    });

    await recipe.populate("createdBy", "username");
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT update a team recipe (admin only)
router.put("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const recipe = await TeamRecipe.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    }).populate("createdBy", "username");
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE a team recipe (admin only)
router.delete("/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    const recipe = await TeamRecipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
