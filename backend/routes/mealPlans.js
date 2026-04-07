const express = require("express");
const router = express.Router();
const MealPlan = require("../models/MealPlan");
const verifyToken = require("../middleware/authMiddleWare");

// POST create a new meal plan for logged-in user
router.post("/", verifyToken, async (req, res) => {
	try {
		const { id, title, plan } = req.body;

		if (!id) {
			return res.status(400).json({ message: "Meal plan id is required." });
		}

		const mealPlan = new MealPlan({
			id,
			title,
			plan,
			owner: req.userId,
		});

		await mealPlan.save();
		return res.status(201).json(mealPlan);
	} catch (err) {
		return res
			.status(400)
			.json({ message: "Error saving meal plan", error: err.message });
	}
});

// POST edit an existing meal plan (owner only)
router.post("/:id", verifyToken, async (req, res) => {
	try {
		const { title, plan } = req.body;

		const mealPlan = await MealPlan.findById(req.params.id);
		if (!mealPlan) {
			return res.status(404).json({ message: "Meal plan not found" });
		}

		if (mealPlan.owner.toString() !== req.userId) {
			return res.status(403).json({ message: "Forbidden" });
		}

		if (title !== undefined) mealPlan.title = title;
		if (plan !== undefined) mealPlan.plan = plan;

		await mealPlan.save();
		return res.json(mealPlan);
	} catch (err) {
		return res
			.status(400)
			.json({ message: "Error updating meal plan", error: err.message });
	}
});

// GET all meal plans for logged-in user
router.get("/", verifyToken, async (req, res) => {
	try {
		const mealPlans = await MealPlan.find({ owner: req.userId }).sort({
			_id: -1,
		});
		return res.json(mealPlans);
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Server error", error: err.message });
	}
});

// GET one specific meal plan by Mongo _id (owner only)
router.get("/:id", verifyToken, async (req, res) => {
	try {
		const mealPlan = await MealPlan.findById(req.params.id);

		if (!mealPlan) {
			return res.status(404).json({ message: "Meal plan not found" });
		}

		if (mealPlan.owner.toString() !== req.userId) {
			return res.status(403).json({ message: "Forbidden" });
		}

		return res.json(mealPlan);
	} catch (err) {
		return res
			.status(500)
			.json({ message: "Server error", error: err.message });
	}
});

module.exports = router;