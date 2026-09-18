const express = require("express");
const { searchRoute } = require("../controllers/mapsController");
const authenticateUser = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/roleMiddleware");

const router = express.Router();

// Authenticated users can search routes.
router.get("/route-search", authenticateUser, authorizeRole(["passenger", "driver", "admin"]), searchRoute);

module.exports = router;
