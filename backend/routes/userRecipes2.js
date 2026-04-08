const express = require("express");
const router = express.Router();
const UserRecipe2 = require("../models/UserRecipe2");
const verifyToken = require("../middleware/authMiddleWare");

// Get all public user recipes (no auth required)
router.get("/public", async (req, res) => {
  try {
    const recipes = await UserRecipe2.find({ isPublic: true })
      .populate("owner", "username")
      .sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all recipes for logged-in user only
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

// Get personalized recipes
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

// Get single user recipe by id (public recipes open, private requires ownership)
router.get("/:id", async (req, res) => {
  try {
    const recipe = await UserRecipe2.findById(req.params.id).populate(
      "owner",
      "username avatar",
    );
    if (!recipe) return res.status(404).json({ message: "Recipe not found." });

    if (!recipe.isPublic) {
      const authHeader = req.headers.authorization;
      if (!authHeader)
        return res.status(403).json({ message: "This recipe is private." });
      try {
        const jwt = require("jsonwebtoken");
        const token = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7)
          : authHeader;
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "fallbackSecret",
        );
        if (recipe.owner._id.toString() !== decoded.id) {
          return res.status(403).json({ message: "This recipe is private." });
        }
      } catch {
        return res.status(403).json({ message: "This recipe is private." });
      }
    }

    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Post recipe for logged-in user only
router.post("/", verifyToken, async (req, res) => {
  try {
    const userRecipe = new UserRecipe2({
      name: req.body.name,
      image: req.body.image,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      owner: req.userId,
      isPublic: req.body.isPublic === true,
    });

    await userRecipe.save();
    res.status(201).json(userRecipe);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error saving recipe", error: err.message });
  }
});

// Update recipe by owner
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const userRecipe = await UserRecipe2.findById(req.params.id);
    if (!userRecipe)
      return res.status(404).json({ message: "Recipe not found." });
    if (userRecipe.owner.toString() !== req.userId) {
      return res
        .status(403)
        .json({
          message: "Forbidden: You do not have permission to edit this recipe.",
        });
    }
    const { name, image, ingredients, instructions, isPublic } = req.body;
    if (name !== undefined) userRecipe.name = name;
    if (image !== undefined) userRecipe.image = image;
    if (ingredients !== undefined) userRecipe.ingredients = ingredients;
    if (instructions !== undefined) userRecipe.instructions = instructions;
    if (isPublic !== undefined) userRecipe.isPublic = isPublic;
    await userRecipe.save();
    res.json(userRecipe);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete recipe by owner
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

    await UserRecipe2.findByIdAndDelete(req.params.id);
    res.json({ message: "UserRecipe successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
