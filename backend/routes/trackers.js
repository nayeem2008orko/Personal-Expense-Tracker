const express = require("express");
const router = express.Router();
const db = require("../db");
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
router.post("/create", authMiddleware, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  db.query(
    "INSERT INTO trackers (user_id, name) VALUES (?, ?)",
    [req.userId, name],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ message: "Tracker created" });
    }
  );
});

// Get all trackers
router.get("/list", authMiddleware, (req, res) => {
  db.query("SELECT * FROM trackers WHERE user_id = ?", [req.userId], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(results);
  });
});

module.exports = router;
