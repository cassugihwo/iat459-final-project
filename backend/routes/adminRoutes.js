const express = require("express");
const router = express.Router();

const User = require("../models/User");
const UserRecipe2 = require("../models/UserRecipe2");
const verifyToken = require("../middleware/authMiddleWare");
const verifyAdmin = require("../middleware/verifyAdmin");

// GET all members
router.get("/members", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch members",
      error: err.message,
    });
  }
});

// SUSPEND member
router.patch("/members/:id/suspend", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User suspended successfully", user });
  } catch (err) {
    res.status(500).json({
      message: "Failed to suspend user",
      error: err.message,
    });
  }
});

// UNSUSPEND member
router.patch("/members/:id/unsuspend", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User unsuspended successfully", user });
  } catch (err) {
    res.status(500).json({
      message: "Failed to unsuspend user",
      error: err.message,
    });
  }
});

// CHANGE member role
router.patch("/members/:id/role", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User role updated successfully", user });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update role",
      error: err.message,
    });
  }
});

// DELETE member
router.delete("/members/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await UserRecipe2.deleteMany({ owner: req.params.id });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete user",
      error: err.message,
    });
  }
});

// GET all content
router.get("/content", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const recipes = await UserRecipe2.find()
      .populate("owner", "username firstName lastName")
      .sort({ createdAt: -1 });

    res.json(recipes);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch content",
      error: err.message,
    });
  }
});

// ADD content
router.post("/content", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, ingredients, instructions, owner, image } = req.body;

    const newRecipe = new UserRecipe2({
      name,
      ingredients,
      instructions,
      image,
      owner: owner || req.userId,
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({
      message: "Failed to create content",
      error: err.message,
    });
  }
});

// EDIT content
router.put("/content/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updatedRecipe = await UserRecipe2.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        image: req.body.image,
      },
      { new: true, runValidators: true }
    );

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Content not found" });
    }

    res.json(updatedRecipe);
  } catch (err) {
    res.status(400).json({
      message: "Failed to update content",
      error: err.message,
    });
  }
});

// DELETE content
router.delete("/content/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const deletedRecipe = await UserRecipe2.findByIdAndDelete(req.params.id);

    if (!deletedRecipe) {
      return res.status(404).json({ message: "Content not found" });
    }

    res.json({ message: "Content deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete content",
      error: err.message,
    });
  }
});

module.exports = router;