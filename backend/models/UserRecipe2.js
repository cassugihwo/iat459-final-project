const mongoose = require("mongoose");

const UserRecipe2Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    ingredients: {
      type: [
        {
          name: String,
          amount: Number,
          unit: String
        },
      ],
      default: [],
    },
    instructions: {
      type: [
        {
          number: Number,
          step: String,
        },
      ],
      default: [],
    },
    owner:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserRecipe2", UserRecipe2Schema);