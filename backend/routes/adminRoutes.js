const express = require("express");
const router = express.Router();

const authenticateUser = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/roleMiddleware");

const adminController = require("../controllers/adminController");

// Only admin can access
router.use(authenticateUser);
router.use(authorizeRole(["admin"]));

// Routes
router.get("/stats", adminController.getStats);
router.post("/routes", adminController.createRoute);
router.get("/routes", adminController.listRoutes);
router.delete("/routes/:routeId", adminController.deleteRoute);

router.get("/buses", adminController.listBuses);
router.post("/buses", adminController.createBus);
router.get("/live", adminController.getLiveBuses);
router.put("/buses/:busId", adminController.updateBus);
router.delete("/buses/:busId", adminController.deleteBus);

router.get("/drivers", adminController.listDrivers);
router.post("/drivers", adminController.createDriver);
router.delete("/drivers/:driverId", adminController.deleteDriver);
router.put("/drivers/:driverId/status", adminController.updateDriverStatus);

router.get("/passengers", adminController.listPassengers);
router.delete("/passengers/:passengerId", adminController.deletePassenger);

router.get("/feedback", adminController.getFeedback);

module.exports = router;