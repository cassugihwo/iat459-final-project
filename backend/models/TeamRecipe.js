const mongoose = require("mongoose");

const TeamRecipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    readyInMinutes: {
      type: Number,
      default: null,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: null,
    },
    ingredients: {
      type: String,
      default: "",
    },
    instructions: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("TeamRecipe", TeamRecipeSchema);
