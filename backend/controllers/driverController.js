const tripRepo = require("../repos/trip.repo");
const admin = require("../config/firebase");
const { todayScheduleDate } = require("../utils/scheduleDate");

const INTERVAL_MS = 10000;
const activeTrackers = new Map(); // driverUid -> { timer, tripId, latestLocation }

// Push to Realtime DB
const pushToRealtimeDb = async (tripId, { latitude, longitude, speedKph, headingDeg, status }) => {
  if ((latitude == null || longitude == null) && !status) return;

  const payload = {
    updatedAt: Date.now(),
  };

  if (latitude != null) payload.latitude = Number(latitude);
  if (longitude != null) payload.longitude = Number(longitude);
  if (speedKph != null) payload.speedKph = Number(speedKph);
  if (headingDeg != null) payload.headingDeg = Number(headingDeg);
  if (status) payload.status = status;

  await admin.database().ref("busLocations").child(tripId).update(payload);
};

// 1️⃣ Get driver’s trips for today
const getTodayTrips = async (req, res) => {
  try {
    const driverUid = req.user.uid;
    const today = todayScheduleDate();
    const trips = await tripRepo.getTripsByDriverAndDate(driverUid, today);
    res.status(200).json({ trips });
  } catch (err) {
    console.error("Get trips error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// 2️⃣ Start trip
const startTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await tripRepo.getTripById(tripId);

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // FIX: Auth check logic
    if (!trip.driverUid || trip.driverUid === "") {
        console.log("No driver assigned, assigning to current user...");
        await tripRepo.updateTrip(tripId, { driverUid: req.user.uid });
    } else if (trip.driverUid !== req.user.uid) {
        console.log("UID Mismatch! DB:", trip.driverUid, "Auth:", req.user.uid);
        return res.status(403).json({ message: "This trip belongs to another driver" });
    }

    // Update status in Firestore and Realtime DB
    await tripRepo.updateTrip(tripId, { status: "active" });
    await pushToRealtimeDb(tripId, { status: "active" });

    // Set up the interval for background location pings
    const timer = setInterval(async () => {
      try {
        const tracker = activeTrackers.get(req.user.uid);
        if (!tracker || !tracker.latestLocation) return;
        
        const { latitude, longitude, speedKph, headingDeg } = tracker.latestLocation;
        if (latitude != null && longitude != null) {
          await pushToRealtimeDb(tripId, { latitude, longitude, speedKph, headingDeg });
        }
      } catch (err) {
        console.error("Interval update error:", err.message);
      }
    }, INTERVAL_MS);

    // Save to local memory map
    activeTrackers.set(req.user.uid, { tripId, timer, latestLocation: null });

    res.status(200).json({ message: "Trip started successfully", tripId });
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
    // Store latest location in memory so the interval can pick it up
    if (tracker) {
        tracker.latestLocation = { latitude, longitude, speedKph, headingDeg };
    }

    // Immediate push to Realtime DB
    await pushToRealtimeDb(tripId, { latitude, longitude, speedKph, headingDeg });
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
