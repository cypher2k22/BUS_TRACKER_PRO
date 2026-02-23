const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const authenticateUser = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/roleMiddleware');
// All routes require driver authentication
router.use(authenticateUser);
router.use(authorizeRole("driver"));
// Get today’s trips
router.get('/trips/today', driverController.getTodayTrips);


// Start a trip
router.post('/trips/:tripId/start', driverController.startTrip);

// Send live location
router.post('/trips/:tripId/ping-location', driverController.pingLocation);

// Stop trip
router.post('/trips/:tripId/stop', driverController.stopTrip);

// Get tracking status
router.get('/trips/status', driverController.getStatus);

module.exports = router;