const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("Backend is working!"));

// Auth routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const tracker = require("./routes/trackers");
app.use("/api/tracker",tracker);

const trackerRoutes = require("./routes/trackerRoutes");
const authMiddleware = require("./middleware/authMiddleware");

app.use("/api/tracker", authMiddleware, trackerRoutes);

const aiRoutes = require("./routes/ai");
app.use("/api/ai",aiRoutes);