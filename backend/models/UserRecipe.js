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
});

module.exports = mongoose.model("UserRecipe", UserRecipeSchema)