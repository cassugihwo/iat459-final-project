const express = require("express");
const router = express.Router();
const UserRecipe = require("../models/UserRecipe");
const verifyToken = require("../middleware/authMiddleWare");

// GET ROUTE (public)
router.get("/", async (req, res) => {
  try {
      const userRecipes = await UserRecipe.find(); // No filter, returns all
      res.json(userRecipes);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// GET ROUTE (personalized)
router.get("/my-recipes", verifyToken, async (req, res) => {
  try {
    const userRecipe = await UserRecipe.find({ owner: req.userId });
    res.json(userRecipe);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE ROUTE
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userRecipe = await UserRecipe.findById(req.params.id);

    // check if userRecipe exists
    if (!userRecipe) {
      return res.status(404).json({ message: "UserRecipe not found" });
    }

    // authorization check: compare document owner ID to requester's ID
    if (userRecipe.owner.toString() !== req.userId) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to delete this UserRecipe.",
      });
    }

    await UserRecipe.findByIdAndDelete(req.params.id);
    res.json({ message: "UserRecipe successfully deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// POST ROUTE
router.post("/", verifyToken, async (req, res) => {
  try {
    const userRecipe = new UserRecipe({
        name: req.body.name,
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

module.exports = router;


