// trackers.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

// Middleware to check auth
function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.id;
    next();
  });
}

// Create tracker
router.post("/create", authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    const result = await pool.query(
      "INSERT INTO trackers (user_id, name, created_at) VALUES ($1, $2, NOW()) RETURNING id",
      [req.userId, name]
    );
    res.status(201).json({ message: "Tracker created", id: result.rows[0].id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Database error" });
  }
});

// List trackers
router.get("/list", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM trackers WHERE user_id = $1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;