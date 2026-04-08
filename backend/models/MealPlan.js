const mongoose = require("mongoose");

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const recipeSnapshotSchema = {
  title: { type: String },
  image: { type: String },
  dishType: { type: String },
  cuisineType: { type: String },
  readyInMinutes: { type: Number },
  isUserRecipe: { type: Boolean, default: false },
  _id: false,
};

const mealPlanSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  plan: {
    type: [
      {
        day: {
          type: String,
          enum: WEEK_DAYS,
          required: true,
        },
        recipes: {
          type: [recipeSnapshotSchema],
          default: [],
        },
        _id: false,
      },
    ],
    required: true,
    validate: {
      validator(days) {
        if (!Array.isArray(days) || days.length !== WEEK_DAYS.length) {
          return false;
        }
        const daySet = new Set(days.map((entry) => entry.day));
        return WEEK_DAYS.every((day) => daySet.has(day));
      },
      message: "Plan must include exactly one entry for each day of the week.",
    },
    default: () => WEEK_DAYS.map((day) => ({ day, recipes: [] })),
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("MealPlan", mealPlanSchema);
