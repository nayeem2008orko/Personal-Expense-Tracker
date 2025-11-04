const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require("./routes/auth");
const trackerRoutes = require("./routes/trackerRoutes");
const aiRoutes = require("./routes/ai");
const authMiddleware = require("./middleware/authMiddleware");

app.use("/api/auth", authRoutes);
app.use("/api/tracker", authMiddleware, trackerRoutes);
app.use("/api/ai", aiRoutes);

// Protect /dashboard
app.get("/dashboard", authMiddleware, (req, res) => {
  res.send(`Welcome to the dashboard, user ID: ${req.user.id}`);
});

app.get("/", (req, res) => res.send("Backend is working!"));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));