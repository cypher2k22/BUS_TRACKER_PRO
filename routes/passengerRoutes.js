const express = require("express");
const authenticateUser = require("../middlewares/authMiddleware");
const { searchbuses } = require("../controllers/passengerController");

const router = express.Router();

// protect all passenger routes
router.use(authenticateUser);

// search buses
router.get("/search-buses", searchbuses);

module.exports = router;
