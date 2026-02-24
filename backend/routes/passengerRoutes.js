const express = require("express");
const authenticateUser = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/roleMiddleware");
const { searchBuses, getBusLiveLocation} = require("../controllers/passengerController");
const router = express.Router();

// search buses
router.get("/search-buses",authenticateUser,authorizeRole(["passenger"]), searchBuses);
router.get("/live/:busId",authenticateUser,authorizeRole(["passenger"]),getBusLiveLocation);



module.exports = router;
