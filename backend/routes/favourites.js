const express = require("express");
const router = express.Router();
const Favourite = require("../models/Favourite");
const verifyToken = require("../middleware/authMiddleWare");

// Get all favourites for logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const favourites = await Favourite.find({ owner: req.userId }).sort({
      createdAt: -1,
    });
    res.json(favourites);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Post toggle favourite (add if not saved, remove if already saved)
router.post("/toggle", verifyToken, async (req, res) => {
  try {
    const { recipeId, title, image, cuisineType, dishType, readyInMinutes } =
      req.body;

    const existing = await Favourite.findOne({
      owner: req.userId,
      recipeId,
    });

    if (existing) {
      await Favourite.findByIdAndDelete(existing._id);
      return res.json({ saved: false });
    }

    await Favourite.create({
      owner: req.userId,
      recipeId,
      title,
      image,
      cuisineType,
      dishType,
      readyInMinutes,
    });

    res.json({ saved: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
