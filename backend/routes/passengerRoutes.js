const express = require("express");
const authenticateUser = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/roleMiddleware");
const { searchBuses, getBusLiveLocation, submitFeedback, getSchedule, getLiveBuses } = require("../controllers/passengerController");
const router = express.Router();

// search buses
router.get("/search-buses", authenticateUser, authorizeRole(["passenger"]), searchBuses);
router.get("/live-buses", authenticateUser, authorizeRole(["passenger"]), getLiveBuses);
router.get("/live/:busId", authenticateUser, authorizeRole(["passenger"]), getBusLiveLocation);
router.post("/feedback", authenticateUser, authorizeRole(["passenger"]), submitFeedback);
router.get("/schedule", authenticateUser, authorizeRole(["passenger"]), getSchedule);

module.exports = router;
