const express = require('express');
const { searchRoute } = require("../controllers/mapsController");
const authenticateUser = require("../middlewares/authMiddleware");

const router = express.Router();

// Search for a route between two locations
router.get('/route-search', authenticateUser, searchRoute);

module.exports = router;
