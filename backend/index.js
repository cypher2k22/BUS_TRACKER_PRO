const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const passengerRoutes = require("./routes/passengerRoutes");
const driverRoutes = require("./routes/driverRoutes");
const adminRoutes = require("./routes/adminRoutes");
const app = express();

// Enable CORS for all origins (for mobile + LAN testing)
app.use(cors({ origin: "*" }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use((req, res, next) => {
  console.log(`📩 INCOMING: ${req.method} ${req.url}`);
  next();
});
app.use("/api/auth", authRoutes);
app.use("/api/passenger", passengerRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/admin", adminRoutes);


// Test endpoint to verify server connectivity
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is reachable!" });
});

/** Confirms you reached this Node process (use same host:port as the app). */
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "bus-tracker-backend",
    cwd: process.cwd(),
    backendRoot: path.resolve(__dirname),
    uptimeSec: Math.floor(process.uptime()),
  });
});

// Start server on LAN-accessible host
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Test URL: http://localhost:${PORT}/api/test`);
  console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;
