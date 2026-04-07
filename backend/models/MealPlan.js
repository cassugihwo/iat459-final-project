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

const mealPlanSchema = new mongoose.Schema(
  {
    id: { 
        type: String,
        required: true,
    },
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
          // Recipe IDs from Spoonacular (numeric-like IDs) or MongoDB (_id).
          recipeIds: {
            type: [String],
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
      default: () => WEEK_DAYS.map((day) => ({ day, recipeIds: [] })),
    },    
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  }
);


module.exports = mongoose.model("MealPlan", mealPlanSchema);
