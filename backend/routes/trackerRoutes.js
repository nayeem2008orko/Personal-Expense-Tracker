const express = require("express");
const router = express.Router();
const db = require("../db");

// Create tracker
router.post("/create", async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id; // from auth middleware
  if (!name) return res.status(400).json({ message: "Name is required" });

  db.query(
    "INSERT INTO trackers (user_id, name) VALUES (?, ?)",
    [userId, name],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.status(201).json({ message: "Tracker created", id: result.insertId });
    }
  );
});

// List trackers for current user
router.get("/list", (req, res) => {
  const userId = req.user.id;
  db.query(
    "SELECT * FROM trackers WHERE user_id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

// Delete tracker
router.delete("/delete/:id", (req, res) => {
  const trackerId = req.params.id;
  db.query("DELETE FROM trackers WHERE id = ?", [trackerId], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Tracker deleted" });
  });
});

// Add entry (income/expense)
router.post("/entry", (req, res) => {
  const { trackerId, entryType, description, amount, entryDate } = req.body;
  if (!trackerId || !entryType || !amount || !entryDate)
    return res.status(400).json({ message: "Missing required fields" });

  db.query(
    "INSERT INTO tracker_entries (tracker_id, entry_type, description, amount, entry_date) VALUES (?, ?, ?, ?, ?)",
    [trackerId, entryType, description || "", amount, entryDate],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json({ message: "Entry added" });
    }
  );
});

// Get entries for tracker
router.get("/entries/:trackerId", (req, res) => {
  const trackerId = req.params.trackerId;
  db.query(
    "SELECT * FROM tracker_entries WHERE tracker_id = ? ORDER BY entry_date ASC",
    [trackerId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.json(results);
    }
  );
});

// Delete entry
router.delete("/entry/:id", (req, res) => {
  const entryId = req.params.id;
  db.query("DELETE FROM tracker_entries WHERE id = ?", [entryId], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Entry deleted" });
  });
});

module.exports = router;
