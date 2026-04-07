const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleWare");
// Get average ratings for recipes (public)
router.get("/bulk-ratings", async (req, res) => {
  try {
    const ids = (req.query.ids || "").split(",").map(Number).filter(Boolean);
    if (!ids.length) return res.json({});
    const reviews = await Review.find({ recipeId: { $in: ids } });
    const result = {};
    ids.forEach((id) => {
      const recipeReviews = reviews.filter((r) => r.recipeId === id);
      result[id] = recipeReviews.length
        ? parseFloat(
            (
              recipeReviews.reduce((s, r) => s + r.rating, 0) /
              recipeReviews.length
            ).toFixed(1),
          )
        : 0;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get average ratings for user recipes in bulk (public)
router.get("/bulk-user-ratings", async (req, res) => {
  try {
    const ids = (req.query.ids || "").split(",").filter(Boolean);
    if (!ids.length) return res.json({});
    const reviews = await Review.find({ userRecipeId: { $in: ids } });
    const result = {};
    ids.forEach((id) => {
      const recipeReviews = reviews.filter((r) => r.userRecipeId === id);
      result[id] = recipeReviews.length
        ? parseFloat(
            (
              recipeReviews.reduce((s, r) => s + r.rating, 0) /
              recipeReviews.length
            ).toFixed(1),
          )
        : 0;
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all reviews for a user recipe (public)
router.get("/user-recipe/:userRecipeId", async (req, res) => {
  try {
    const reviews = await Review.find({ userRecipeId: req.params.userRecipeId })
      .populate("owner", "avatar")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Post add a review for a user recipe (auth required)
router.post("/user-recipe/:userRecipeId", verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating) {
      return res.status(400).json({ message: "Rating is required." });
    }

    const user = await User.findById(req.userId).select("username");
    if (!user) return res.status(404).json({ message: "User not found." });

    const review = await Review.create({
      userRecipeId: req.params.userRecipeId,
      owner: req.userId,
      username: user.username,
      rating,
      comment,
    });

    await review.populate("owner", "avatar");
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all reviews for a recipe (public)
router.get("/:recipeId", async (req, res) => {
  try {
    const reviews = await Review.find({ recipeId: req.params.recipeId })
      .populate("owner", "avatar")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Post add a new review (auth required)
router.post("/:recipeId", verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating) {
      return res.status(400).json({ message: "Rating is required." });
    }

    const user = await User.findById(req.userId).select("username");
    if (!user) return res.status(404).json({ message: "User not found." });

    const review = await Review.create({
      recipeId: req.params.recipeId,
      owner: req.userId,
      username: user.username,
      rating,
      comment,
    });

    await review.populate("owner", "avatar");
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete a specific review by its _id (owner only)
router.delete("/:reviewId", verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found." });
    if (String(review.owner) !== String(req.userId)) {
      return res.status(403).json({ message: "Not allowed." });
    }
    await review.deleteOne();
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
