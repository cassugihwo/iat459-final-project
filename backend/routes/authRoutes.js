const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleWare");

const router = express.Router();

// Register/ Signup
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, username, password } = req.body;

    if (!firstName || !lastName || !username || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Please enter username and password." });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (user.isSuspended) {
      return res
        .status(403)
        .json({ message: "Your account has been suspended." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// Get profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

// PUT update profile
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { avatar, firstName, lastName, username } = req.body;

    if (username) {
      const existing = await User.findOne({
        username,
        _id: { $ne: req.userId },
      });
      if (existing)
        return res.status(400).json({ message: "Username already taken." });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        avatar,
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(username && { username }),
      },
      { returnDocument: "after" },
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
