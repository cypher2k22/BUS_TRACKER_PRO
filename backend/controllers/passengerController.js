const busRepo = require("../repos/bus.repo");
const { todayScheduleDate } = require("../utils/scheduleDate");


// =======================================
// SEARCH BUSES (direct + multi-bus combined)
// =======================================
const searchBuses = async (req, res) => {
  try {
    const { from, to, date, lat, lng } = req.query;
    if (!from || !to || !date) return res.status(400).json({ message: "From, To and Date are required" });

    const passengerLat = lat ? Number(lat) : null;
    const passengerLng = lng ? Number(lng) : null;

    const routes = await busRepo.findRoutesForPassenger({ from, to, date, lat: passengerLat, lng: passengerLng });

    // Sort: direct first, then multi-bus by fewest transfers
    routes.sort((a, b) => (a.transfers ?? 0) - (b.transfers ?? 0));

    res.status(200).json({ success: true, count: routes.length, data: routes });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================================
// SUBMIT FEEDBACK
// =======================================
const submitFeedback = async (req, res) => {
  try {
    const { feedback, rating } = req.body;
    const userId = req.user.uid;

    if (!feedback || !rating) {
      return res.status(400).json({ message: "Feedback and rating are required." });
    }

    const admin = require("../config/firebase");
    await admin.firestore().collection("feedback").add({
      userId,
      feedback,
      rating,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("FEEDBACK ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================================
// GET DAILY SCHEDULE
// =======================================
const getSchedule = async (req, res) => {
  try {
    const date = todayScheduleDate();
    const admin = require("../config/firebase");
    const snapshot = await admin.firestore()
      .collection("ScheduledBuses")
      .where("date", "==", date)
      .where("status", "in", ["scheduled", "active"])
      .get();

    let buses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, buses });
  } catch (error) {
    console.error("SCHEDULE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getBusLiveLocation = async (req, res) => {
  try {
    const { busId } = req.params;
    const bus = await busRepo.getBusById(busId);
    if (!bus) return res.status(404).json({ message: "Bus not found" });

    const locationSnap = await require("../config/firebase").database().ref(`busLocations/${busId}`).get();
    if (!locationSnap.exists()) return res.status(404).json({ message: "Location not found" });

    const location = locationSnap.val();
    res.status(200).json({
      success: true,
      busId,
      busNumber: bus.plateNumber,
      routeId: bus.routeId,
      driverUid: bus.driverUid,
      stops: bus.stops,
      latitude: location.latitude,
      longitude: location.longitude,
      speedKph: location.speedKph,
      headingDeg: location.headingDeg,
      updatedAt: location.updatedAt
    });

  } catch (error) {
    console.error("LIVE LOCATION ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getLiveBuses = async (req, res) => {
  try {
    const admin = require("../config/firebase");
    const date = todayScheduleDate();
    
    // Get all buses that are currently active for today
    const snapshot = await admin.firestore()
      .collection("ScheduledBuses")
      .where("date", "==", date)
      .where("status", "==", "active")
      .get();

    const activeTrips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch live locations from Realtime DB
    const locationsSnap = await admin.database().ref('busLocations').get();
    const locations = locationsSnap.exists() ? locationsSnap.val() : {};

    const liveData = activeTrips.map(trip => ({
      tripId: trip.id,
      busNumber: trip.plateNumber,
      routeNumber: trip.routeNumber,
      lat: locations[trip.id]?.latitude || 0,
      lng: locations[trip.id]?.longitude || 0,
      speed: locations[trip.id]?.speedKph || 0,
      updatedAt: locations[trip.id]?.updatedAt || 0
    })).filter(b => b.lat !== 0 && b.lng !== 0);

    res.json({ success: true, count: liveData.length, data: liveData });
  } catch (err) {
    console.error("GET LIVE BUSES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  searchBuses,
  getBusLiveLocation,
  submitFeedback,
  getSchedule,
  getLiveBuses
};