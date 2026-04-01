const mongoose = require("mongoose");

const UserRecipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ingredients: {
      type: String,
    },
    instructions: {
      type: String,
    },
    owner:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserRecipe", UserRecipeSchema);