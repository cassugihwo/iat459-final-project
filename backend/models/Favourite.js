const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipeId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    title: {
      type: String,
    },
    image: {
      type: String,
    },
    cuisineType: {
      type: String,
    },
    dishType: {
      type: String,
    },
    readyInMinutes: {
      type: Number,
    },
  },
  { timestamps: true },
);

// Ensure a user can only have one favourite per recipe
favouriteSchema.index({ owner: 1, recipeId: 1 }, { unique: true });

module.exports = mongoose.model("Favourite", favouriteSchema);
