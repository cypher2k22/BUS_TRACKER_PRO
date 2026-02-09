const express = require("express");
require("dotenv").config();
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const passengerRoutes = require("./routes/passengerRoutes");

const app = express();

// Enable CORS for all origins (for mobile + LAN testing)
app.use(cors({ origin: "*" }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/passenger", passengerRoutes);

// Test endpoint to verify server connectivity
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is reachable!" });
});

// Start server on LAN-accessible host
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Test URL: http://localhost:${PORT}/api/test`);
});

module.exports = app;
