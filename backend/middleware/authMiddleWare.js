const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  // 1. Get token from header
  const token = req.header("Authorization");

  // 2. Check if token exists
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    // 3. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallbackSecret",
    );
    req.userId = decoded.id; // Add user ID to request
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = verifyToken;
