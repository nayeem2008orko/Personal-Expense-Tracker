const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require login
router.use(authMiddleware);

// Create tracker
router.post("/create", async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;
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

// Delete tracker (only owner)
router.delete("/delete/:id", (req, res) => {
  const trackerId = req.params.id;
  const userId = req.user.id;

  db.query(
    "DELETE FROM trackers WHERE id = ? AND user_id = ?",
    [trackerId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Tracker not found or not yours" });
      res.json({ message: "Tracker deleted" });
    }
  );
});

// Add entry (income/expense) (only owner)
router.post("/entry", (req, res) => {
  const { trackerId, entryType, description, amount, entryDate } = req.body;
  const userId = req.user.id;

  if (!trackerId || !entryType || !amount || !entryDate)
    return res.status(400).json({ message: "Missing required fields" });

  // Check if tracker belongs to user
  db.query(
    "SELECT * FROM trackers WHERE id = ? AND user_id = ?",
    [trackerId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ message: "Tracker not found or not yours" });

      // Insert entry
      db.query(
        "INSERT INTO tracker_entries (tracker_id, entry_type, description, amount, entry_date) VALUES (?, ?, ?, ?, ?)",
        [trackerId, entryType, description || "", amount, entryDate],
        (err) => {
          if (err) return res.status(500).json({ message: "Database error" });
          res.json({ message: "Entry added" });
        }
      );
    }
  );
});

// Get entries for tracker (only owner)
router.get("/entries/:trackerId", (req, res) => {
  const trackerId = req.params.trackerId;
  const userId = req.user.id;

  // Check ownership
  db.query(
    "SELECT * FROM trackers WHERE id = ? AND user_id = ?",
    [trackerId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ message: "Tracker not found or not yours" });

      // Fetch entries
      db.query(
        "SELECT * FROM tracker_entries WHERE tracker_id = ? ORDER BY entry_date ASC",
        [trackerId],
        (err, entries) => {
          if (err) return res.status(500).json({ message: "Database error" });
          res.json(entries);
        }
      );
    }
  );
});

// Delete entry (only owner)
router.delete("/entry/:id", (req, res) => {
  const entryId = req.params.id;
  const userId = req.user.id;

  // Make sure entry belongs to user's tracker
  db.query(
    "SELECT t.id FROM tracker_entries e JOIN trackers t ON e.tracker_id = t.id WHERE e.id = ? AND t.user_id = ?",
    [entryId, userId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (results.length === 0)
        return res.status(404).json({ message: "Entry not found or not yours" });

      db.query("DELETE FROM tracker_entries WHERE id = ?", [entryId], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Entry deleted" });
      });
    }
  );
});

module.exports = router;