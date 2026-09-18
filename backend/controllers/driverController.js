const tripRepo = require("../repos/trip.repo");
const admin = require("../config/firebase");
const { todayScheduleDate } = require("../utils/scheduleDate");

const INTERVAL_MS = 10000;
const activeTrackers = new Map();

const pushToRealtimeDb = async (tripId, { latitude, longitude, speedKph, headingDeg, status }) => {
  if ((latitude == null || longitude == null) && !status) return;

  const payload = { updatedAt: Date.now() };

  if (latitude != null) payload.latitude = Number(latitude);
  if (longitude != null) payload.longitude = Number(longitude);
  if (speedKph != null) payload.speedKph = Number(speedKph);
  if (headingDeg != null) payload.headingDeg = Number(headingDeg);
  if (status) payload.status = status;

  await admin.database().ref("busLocations").child(tripId).update(payload);
};

const getTodayTrips = async (req, res) => {
  try {
    const trips = await tripRepo.getTripsByDriverAndDate(req.user.uid, todayScheduleDate());
    res.status(200).json({ trips });
  } catch (err) {
    console.error("Get trips error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const startTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await tripRepo.getTripById(tripId);

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.driverUid && trip.driverUid !== req.user.uid) {
      return res.status(403).json({ message: "This trip belongs to another driver" });
    }

    const existing = activeTrackers.get(req.user.uid);
    if (existing) {
      if (existing.tripId === tripId) {
        return res.status(200).json({ message: "Trip is already active", tripId });
      }
      return res.status(409).json({ message: "Driver already has an active trip" });
    }

    if (!trip.driverUid) {
      await tripRepo.updateTrip(tripId, { driverUid: req.user.uid });
    }

    await tripRepo.updateTrip(tripId, { status: "active" });
    await pushToRealtimeDb(tripId, { status: "active" });

    const tracker = { tripId, timer: null, latestLocation: null };
    tracker.timer = setInterval(async () => {
      try {
        const current = activeTrackers.get(req.user.uid);
        if (!current?.latestLocation) return;
        await pushToRealtimeDb(tripId, current.latestLocation);
      } catch (err) {
        console.error("Interval update error:", err.message);
      }
    }, INTERVAL_MS);

    activeTrackers.set(req.user.uid, tracker);
    res.status(200).json({ message: "Trip started successfully", tripId });
  } catch (err) {
    console.error("Start trip error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const pingLocation = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { latitude, longitude, speedKph, headingDeg } = req.body;

    const trip = await tripRepo.getTripById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (trip.driverUid !== req.user.uid) {
      return res.status(403).json({ message: "Not authorized for this trip" });
    }

    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
      return res.status(400).json({ message: "Valid latitude and longitude are required" });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ message: "Latitude or longitude is out of range" });
    }

    const tracker = activeTrackers.get(req.user.uid);
    if (tracker?.tripId === tripId) {
      tracker.latestLocation = { latitude: lat, longitude: lng, speedKph, headingDeg };
    }

    await pushToRealtimeDb(tripId, { latitude: lat, longitude: lng, speedKph, headingDeg });
    res.status(200).json({ message: "Location updated", tripId });
  } catch (err) {
    console.error("Ping location error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

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

const getStatus = (req, res) => {
  const tracker = activeTrackers.get(req.user.uid);
  res.status(200).json({
    running: Boolean(tracker),
    tripId: tracker?.tripId ?? null,
    intervalMs: INTERVAL_MS,
  });
};

module.exports = { getTodayTrips, startTrip, pingLocation, stopTrip, getStatus };
