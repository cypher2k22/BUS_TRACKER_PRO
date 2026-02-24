const routeRepo = require("../repos/route.repo");
const busRepo = require("../repos/bus.repo");

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
const getDriverUidByLicense = async (licenseNumber) => {
  const snapshot = await admin.firestore().collection("users")
    .where("role", "==", "driver")
    .where("LicenseNumber", "==", licenseNumber)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data().uid;
};

// Get route ID by route number
const getRouteIdByNumber = async (routeNumber) => {
  const snapshot = await admin.firestore().collection("routes")
    .where("routenumber", "==", routeNumber)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].id;
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

module.exports = {
  createRoute,
  listRoutes,
  createBus,
  updateBus,
  deleteBus,getDriverUidByLicense,
  getRouteIdByNumber
};