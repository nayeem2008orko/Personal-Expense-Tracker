const express = require("express");
const router = express.Router();
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const { encryptId, decryptId } = require("../utils/encryption"); // your existing encryption.js

router.use(authMiddleware);

// Create tracker
router.post("/create", async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;
  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    const result = await db.query(
      "INSERT INTO trackers (user_id, name, created_at) VALUES ($1, $2, NOW()) RETURNING id",
      [userId, name]
    );

    // Encrypt the ID for frontend
    const encryptedId = encryptId(result.rows[0].id);
    res.status(201).json({ message: "Tracker created", id: encryptedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// List trackers
router.get("/list", async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      "SELECT * FROM trackers WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    // Encrypt all IDs before sending to frontend
    const trackers = result.rows.map((t) => ({
      ...t,
      id: encryptId(t.id),
    }));

    res.json(trackers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// Delete tracker
router.delete("/delete/:encryptedId", async (req, res) => {
  const userId = req.user.id;
  let trackerId;

  try {
    trackerId = decryptId(req.params.encryptedId); // decrypt incoming ID
  } catch {
    return res.status(400).json({ message: "Invalid tracker ID" });
  }

  try {
    const result = await db.query(
      "DELETE FROM trackers WHERE id = $1 AND user_id = $2 RETURNING id",
      [trackerId, userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Tracker not found or not yours" });

    res.json({ message: "Tracker deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// Add entry
router.post("/entry", async (req, res) => {
  const { trackerId: encTrackerId, entryType, description, amount, entryDate } = req.body;
  const userId = req.user.id;

  if (!encTrackerId || !entryType || !amount || !entryDate)
    return res.status(400).json({ message: "Missing required fields" });

  let trackerId;
  try {
    trackerId = decryptId(encTrackerId); // decrypt tracker ID
  } catch {
    return res.status(400).json({ message: "Invalid tracker ID" });
  }

  try {
    const tracker = await db.query(
      "SELECT * FROM trackers WHERE id = $1 AND user_id = $2",
      [trackerId, userId]
    );
    if (tracker.rows.length === 0)
      return res.status(404).json({ message: "Tracker not found or not yours" });

    await db.query(
      "INSERT INTO tracker_entries (tracker_id, entry_type, description, amount, entry_date) VALUES ($1, $2, $3, $4, $5)",
      [trackerId, entryType, description || "", amount, entryDate]
    );
    res.json({ message: "Entry added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// Get entries for tracker
router.get("/entries/:encryptedId", async (req, res) => {
  const userId = req.user.id;
  let trackerId;

  try {
    trackerId = decryptId(req.params.encryptedId); // decrypt tracker ID
  } catch {
    return res.status(400).json({ message: "Invalid tracker ID" });
  }

  try {
    const tracker = await db.query(
      "SELECT * FROM trackers WHERE id = $1 AND user_id = $2",
      [trackerId, userId]
    );
    if (tracker.rows.length === 0)
      return res.status(404).json({ message: "Tracker not found or not yours" });

    const entries = await db.query(
      "SELECT * FROM tracker_entries WHERE tracker_id = $1 ORDER BY entry_date ASC",
      [trackerId]
    );

    res.json(entries.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// Delete entry
router.delete("/entry/:id", async (req, res) => {
  const entryId = req.params.id;
  const userId = req.user.id;

  try {
    const check = await db.query(
      "SELECT t.id FROM tracker_entries e JOIN trackers t ON e.tracker_id = t.id WHERE e.id = $1 AND t.user_id = $2",
      [entryId, userId]
    );
    if (check.rows.length === 0)
      return res.status(404).json({ message: "Entry not found or not yours" });

    await db.query("DELETE FROM tracker_entries WHERE id = $1", [entryId]);
    res.json({ message: "Entry deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;