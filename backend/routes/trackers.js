const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Encryption setup
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "32charslongsecretkeymustb32!"; // 32 chars
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text.toString());
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text) {
  const [ivHex, encryptedHex] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return parseInt(decrypted.toString());
}

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
    const encryptedId = encrypt(result.rows[0].id);
    res.status(201).json({ message: "Tracker created", id: encryptedId });
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

    // Encrypt IDs for all trackers
    const trackers = result.rows.map((t) => ({
      ...t,
      id: encrypt(t.id),
    }));

    res.json(trackers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;