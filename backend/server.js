require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRecipeRoutes = require("./routes/userRecipes");
const authRoutes = require("./routes/authRoutes");
const homeRecipesRoutes = require("./routes/homeRecipeRoute");
const verifyToken = require("./middleware/authMiddleWare");

const app = express();
const PORT = 5001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use("/api", homeRecipesRoutes);

const uri = process.env.MONGO_URI;

async function connectDB() {
  try {
    await mongoose.connect(uri);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Connection failed:", err);
  }
}
connectDB();

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from the Node backend!" });
});
app.use("/api/auth", authRoutes);
app.use("/api/user-recipes", userRecipeRoutes);
// example protected route
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: `Hello ${req.user.username}, you accessed a protected route.`,
    user: req.user,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});