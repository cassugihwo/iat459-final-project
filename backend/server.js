require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRecipe2Routes = require("./routes/userRecipes2");
const authRoutes = require("./routes/authRoutes");
const homeRecipesRoutes = require("./routes/homeRecipeRoute");
const adminRoutes = require("./routes/adminRoutes");
const favouriteRoutes = require("./routes/favourites");
const reviewRoutes = require("./routes/review");
const verifyToken = require("./middleware/authMiddleWare");

const app = express();
const PORT = 5001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json({ limit: "10mb" }));

app.use("/api", homeRecipesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user-recipes2", userRecipe2Routes);
app.use("/api/admin", adminRoutes);
app.use("/api/favourites", favouriteRoutes);
app.use("/api/reviews", reviewRoutes);

const uri = process.env.MONGO_URI;

async function connectDB() {
  try {
    await mongoose.connect(uri);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("✅ Connected to MongoDB");

    // Drop the unique compound index on reviews if it exists,
    // so users can submit multiple reviews per recipe.
    try {
      await mongoose.connection.db.collection("reviews").dropIndex("owner_1_recipeId_1");
      console.log("✅ Dropped unique review index");
    } catch (e) {
      // Index doesn't exist or already dropped — that's fine
    };
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}
connectDB();

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the Node backend!" });
});

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: `Hello ${req.user.username}, you accessed a protected route.`,
    user: req.user,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
