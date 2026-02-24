const tripRepo = require("../repos/trip.repo");
const admin = require("../config/firebase");

const INTERVAL_MS = 10000;
const activeTrackers = new Map(); // driverUid -> { timer, tripId }

// Push to Realtime DB
const pushToRealtimeDb = async (tripId, { latitude, longitude, speedKph, headingDeg, status }) => {
  if ((latitude == null || longitude == null) && !status) return;

  const payload = {
    latitude: latitude != null ? Number(latitude) : undefined,
    longitude: longitude != null ? Number(longitude) : undefined,
    speedKph: speedKph != null ? Number(speedKph) : null,
    headingDeg: headingDeg != null ? Number(headingDeg) : null,
    updatedAt: Date.now(),
  };

  if (status) payload.status = status;

  await admin.database().ref("busLocations").child(tripId).set(payload);
};

// 1️⃣ Get driver’s trips for today
const getTodayTrips = async (req, res) => {
  try {
    const driverUid = req.user.uid;
    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

    const trips = await tripRepo.getTripsByDriverAndDate(driverUid, today);
    res.status(200).json({ trips });
  } catch (err) {
    console.error("Get trips error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2️⃣ Start trip
const startTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await tripRepo.getTripById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (trip.driverUid !== req.user.uid) return res.status(403).json({ message: "Not authorized" });

    await tripRepo.updateTrip(tripId, { status: "active" });
    await pushToRealtimeDb(tripId, { status: "active" });

    const timer = setInterval(async () => {
      try {
        const tracker = activeTrackers.get(req.user.uid);
        if (!tracker) return;
        const { latitude, longitude, speedKph, headingDeg } = tracker.latestLocation || {};
        if (latitude != null && longitude != null) {
          await pushToRealtimeDb(tripId, { latitude, longitude, speedKph, headingDeg });
        }
      } catch (err) {
        console.error("Interval update error:", err.message);
      }
    }, INTERVAL_MS);

    activeTrackers.set(req.user.uid, { tripId, timer });
    res.status(200).json({ message: "Trip started with auto-ping", tripId });
  } catch (err) {
    console.error("Start trip error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 3️⃣ Ping live location
const pingLocation = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { latitude, longitude, speedKph, headingDeg } = req.body;

    const tracker = activeTrackers.get(req.user.uid);
    if (tracker) tracker.latestLocation = { latitude, longitude, speedKph, headingDeg };

    await pushToRealtimeDb(tripId, { latitude, longitude, speedKph, headingDeg, driverUid: req.user.uid });
    res.status(200).json({ message: "Location updated", tripId });
  } catch (err) {
    console.error("Ping location error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 4️⃣ Stop trip
const stopTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await tripRepo.getTripById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (trip.driverUid !== req.user.uid) return res.status(403).json({ message: "Not authorized" });

    await tripRepo.updateTrip(tripId, { status: "completed" });
    await pushToRealtimeDb(tripId, { status: "completed" });

    const tracker = activeTrackers.get(req.user.uid);
    if (tracker?.timer) clearInterval(tracker.timer);
    activeTrackers.delete(req.user.uid);

    res.status(200).json({ message: "Trip stopped", tripId });
  } catch (err) {
    console.error("Stop trip error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 5️⃣ Get tracking status
const getStatus = (req, res) => {
  const tracker = activeTrackers.get(req.user.uid);
  res.status(200).json({
    running: !!tracker,
    tripId: tracker?.tripId,
    intervalMs: INTERVAL_MS,
  });
};

module.exports = { getTodayTrips, startTrip, pingLocation, stopTrip, getStatus };