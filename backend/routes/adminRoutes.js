const express = require("express");
const router = express.Router();

const authenticateUser = require("../middlewares/authMiddleware");
const authorizeRole = require("../middlewares/roleMiddleware");

const adminController = require("../controllers/adminController");

// Only admin can access
router.use(authenticateUser);
router.use(authorizeRole(["admin"]));

// Routes
router.post("/routes", adminController.createRoute);
router.get("/routes", adminController.listRoutes);

router.post("/buses", adminController.createBus);
router.put("/buses/:busId", adminController.updateBus);
router.delete("/buses/:busId", adminController.deleteBus);

module.exports = router;