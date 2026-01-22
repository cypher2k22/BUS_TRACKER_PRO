const express = require("express");
const authenticateUser = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/roleMiddleware");
const { searchbuses } = require("../controllers/passengerController");

const router = express.Router();

// protect all passenger routes
router.use(authenticateUser);

router.use(authorizeRole(["passenger"]));

// search buses
router.get("/search-buses", searchbuses);

module.exports = router;
