const routeRepo = require("../repos/route.repo");
const busRepo = require("../repos/bus.repo");
const userRepo = require("../repos/user.repo");

// ================= ROUTES =================
const createRoute = async (req, res) => {
  try {
    const { name, stops, description, polyline } = req.body;
    const route = await routeRepo.createRoute({ name, stops, description, polyline });
    res.status(201).json({ message: "Route created", data: route });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const listRoutes = async (req, res) => {
  try {
    const routes = await routeRepo.listRoutes();
    res.json({ data: routes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    await routeRepo.deleteRoute(routeId);
    res.json({ message: "Route deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ================= SCHEDULE BUS =================
const createBus = async (req, res) => {
  try {
    const bus = await busRepo.createBus(req.body);
    res.status(201).json({
      message: "Bus scheduled successfully",
      data: bus
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE BUS =================
const updateBus = async (req, res) => {
  try {
    const { busId } = req.params;
    const bus = await busRepo.updateBusDetails(busId, req.body);
    res.json({
      message: "Bus updated successfully",
      data: bus
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE BUS =================
const deleteBus = async (req, res) => {
  try {
    const { busId } = req.params;
    await busRepo.deleteBus(busId);
    res.json({ message: "Bus deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET ALL BUSES =================
const listBuses = async (req, res) => {
  try {
    const admin = require("../config/firebase");
    const snapshot = await admin.firestore().collection("ScheduledBuses").get();
    const buses = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json(buses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET LIVE BUSES =================
const getLiveBuses = async (req, res) => {
  try {
    const admin = require("../config/firebase");
    const snapshot = await admin.firestore()
      .collection("ScheduledBuses")
      .where("status", "in", ["active", "scheduled"])
      .get();

    const activeBuses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get locations from realtime DB
    const locationsSnap = await admin.database().ref('busLocations').get();
    const locations = locationsSnap.exists() ? locationsSnap.val() : {};

    const liveData = activeBuses.map(bus => ({
      busId: bus.id,
      busNumber: bus.plateNumber,
      lat: locations[bus.id]?.latitude || 0,
      lng: locations[bus.id]?.longitude || 0,
      speed: locations[bus.id]?.speedKph || 0
    })).filter(b => b.lat !== 0 && b.lng !== 0);

    res.json(liveData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET STATS =================
const getStats = async (req, res) => {
  try {
    const db = require("../config/firebase").firestore();

    const [busesSnap, driversSnap, routesSnap] = await Promise.all([
      db.collection("ScheduledBuses").get(),
      db.collection("users").where("role", "==", "driver").get(),
      db.collection("routes").get(),
    ]);

    const stats = {
      buses: busesSnap.size,
      drivers: driversSnap.size,
      routes: routesSnap.size,
      live: busesSnap.docs.filter(d => d.data().status === 'active').length
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DRIVERS =================
const listDrivers = async (req, res) => {
  try {
    const drivers = await userRepo.listDrivers();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createDriver = async (req, res) => {
  try {
    const { username, email, password, NICNumber, LicenseNumber } = req.body;
    const uid = await userRepo.createUser({ username, email, password, role: "driver", NICNumber, LicenseNumber });
    res.status(201).json({ message: "Driver created successfully", uid });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    await userRepo.deleteUser(driverId);
    res.json({ message: "Driver deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createRoute,
  listRoutes,
  deleteRoute,
  createBus,
  updateBus,
  deleteBus,
  getStats,
  listBuses,
  getLiveBuses,
  listDrivers,
  createDriver,
  deleteDriver
};