const express = require("express");
const authenticateUser = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/roleMiddleware");
const { searchbuses } = require("../controllers/passengerController");
const router = express.Router();

const { getBusLiveLocation,getRoutePolyline } = require("../controllers/passengerController");

// search buses
router.get("/search-buses",authenticateUser,authorizeRole("passenger"), searchbuses);
router.get("/live/:busId",authenticateUser,authorizeRole("passenger"),getBusLiveLocation);

router.get("/route/:busId",authenticateUser,authorizeRole("passenger"),getRoutePolyline);

module.exports = router;
