const express = require("express");
require("dotenv").config();
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const passengerRoutes = require("./routes/passengerRoutes");
const driverRoutes = require("./routes/driverRoutes");
const adminRoutes = require("./routes/adminRoutes");
const mapsRoutes = require("./routes/mapsRoutes");

const app = express();

// Mobile/native clients often do not send an Origin header. Browser origins
// should be explicitly configured; avoid allowing every website by default.
const allowedOrigins = (process.env.CORS_ORIGINS ||
  "http://localhost:8081,http://localhost:19006,http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use((req, res, next) => {
    console.log(`📩 ${req.method} ${req.path}`);
    next();
  });
}

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "bus-tracker-backend",
    uptimeSec: Math.floor(process.uptime()),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/passenger", passengerRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/maps", mapsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Log diagnostic details on the server, but never expose them to API clients.
  console.error("Unhandled API error:", {
    method: req.method,
    path: req.path,
    message: err.message,
  });
  res.status(err.status && err.status >= 400 && err.status < 500 ? err.status : 500)
    .json({
      message:
        err.status && err.status >= 400 && err.status < 500
          ? err.message
          : "Internal server error",
    });
});

const PORT = Number(process.env.PORT) || 3000;

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ BusTrack backend listening on port ${PORT}`);
  });
}

module.exports = app;
