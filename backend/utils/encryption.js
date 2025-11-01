const crypto = require("crypto");

const SECRET_KEY = process.env.ID_SECRET_KEY || "super_secret_key"; // any length
const ALGORITHM = "aes-256-ctr";
const IV_LENGTH = 16; // initialization vector length

// derive a 32-byte key from the secret
const KEY = crypto.createHash("sha256").update(SECRET_KEY).digest();

function encryptId(id) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(String(id), "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decryptId(encryptedId) {
  const [ivHex, encryptedHex] = encryptedId.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return parseInt(decrypted.toString("utf8"));
}

module.exports = { encryptId, decryptId };