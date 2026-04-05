const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role:{
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user"
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    bio: { type: String, default: "" },
    links: { type: [String], default: [] },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);