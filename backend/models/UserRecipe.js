const mongoose = require("mongoose");

const UserRecipeSchema = new mongoose.Schema ({
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
});

module.exports = mongoose.model("UserRecipe", UserRecipeSchema)