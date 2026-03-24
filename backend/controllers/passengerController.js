const busRepo = require("../repos/bus.repo");


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
    const date = new Date().toISOString().split("T")[0];
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

module.exports = {
  searchBuses,
  getBusLiveLocation,
  submitFeedback,
  getSchedule
};