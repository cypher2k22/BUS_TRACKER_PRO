const routeRepo = require("../repos/route.repo");
const busRepo = require("../repos/bus.repo");
const userRepo = require("../repos/user.repo");
const axios = require("axios");
const polyline = require("polyline");

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Helper to geocode an address
const geocode = async (address) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
  const response = await axios.get(url);
  if (response.data.status !== "OK") throw new Error(`Geocoding failed for ${address}`);
  return response.data.results[0].geometry.location;
};

// ================= ROUTES =================
const detectStops = async (req, res) => {
  try {
    const { start, end } = req.body;
    if (!start || !end) return res.status(400).json({ message: "Start and end locations required" });

    if (!GOOGLE_MAPS_API_KEY) {
      console.error("❌ GOOGLE_MAPS_API_KEY is missing in backend .env");
      return res.status(500).json({ message: "Google Maps API Key not configured on server" });
    }

    // 1. Geocode
    const startCoords = await geocode(start);
    const endCoords = await geocode(end);

    // 2. Get Route (Directions V2)
    const routesUrl = "https://routes.googleapis.com/directions/v2:computeRoutes";
    const routesResponse = await axios.post(routesUrl, {
      origin: { location: { latLng: { latitude: startCoords.lat, longitude: startCoords.lng } } },
      destination: { location: { latLng: { latitude: endCoords.lat, longitude: endCoords.lng } } },
      travelMode: "DRIVE"
    }, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.polyline.encodedPolyline,routes.legs.steps"
      }
    });

    if (!routesResponse.data || !routesResponse.data.routes || routesResponse.data.routes.length === 0) {
        console.error("❌ No routes found in Google API response:", JSON.stringify(routesResponse.data, null, 2));
        return res.status(404).json({ message: "No route found between these locations" });
    }

    const route = routesResponse.data.routes[0];
    if (!route.polyline || !route.legs || !route.legs[0].steps) {
        console.error("❌ Unexpected route format from Google API:", JSON.stringify(route, null, 2));
        return res.status(500).json({ message: "Google API returned an incomplete route" });
    }

    const encodedPolyline = route.polyline.encodedPolyline;
    const steps = route.legs[0].steps;

    // 3. Sample points and find stops
    const stopsMap = new Map();
    const samplePoints = [startCoords];
    steps.forEach((s, i) => { 
        if (i % 5 === 0 && s.endLocation?.latLng) { 
            samplePoints.push({ 
                lat: s.endLocation.latLng.latitude, 
                lng: s.endLocation.latLng.longitude 
            }); 
        } 
    });
    samplePoints.push(endCoords);

    for (const point of samplePoints.slice(0, 10)) {
      try {
        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${point.lat},${point.lng}&radius=2000&type=bus_station&key=${GOOGLE_MAPS_API_KEY}`;
        const placesResponse = await axios.get(placesUrl);
        if (placesResponse.data.results) {
          placesResponse.data.results.forEach(p => {
            stopsMap.set(p.place_id, {
              name: p.name,
              latitude: p.geometry.location.lat,
              longitude: p.geometry.location.lng,
              id: p.place_id
            });
          });
        }
      } catch (placeErr) {
        console.warn("Place search failed for sample point:", point, placeErr.message);
      }
    }

    res.json({
      polyline: encodedPolyline,
      stops: Array.from(stopsMap.values()),
      startLocation: { name: start, ...startCoords },
      endLocation: { name: end, ...endCoords }
    });

  } catch (err) {
    if (err.response) {
        console.error("❌ API Error Data:", JSON.stringify(err.response.data, null, 2));
    }
    console.error("❌ Detect stops error:", err.message);
    res.status(500).json({ message: err.message || "Internal server error during stop detection" });
  }
};

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

    const [busesSnap, driversSnap, routesSnap, passengersSnap] = await Promise.all([
      db.collection("ScheduledBuses").get(),
      db.collection("users").where("role", "==", "driver").get(),
      db.collection("routes").get(),
      db.collection("users").where("role", "==", "passenger").get(),
    ]);

    const stats = {
      buses: busesSnap.size,
      drivers: driversSnap.size,
      passengers: passengersSnap.size,
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

const updateDriverStatus = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { isDisabled } = req.body;
    await userRepo.toggleUserStatus(driverId, isDisabled);
    res.json({ message: `Driver account ${isDisabled ? 'disabled' : 'enabled'} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= PASSENGERS =================
const listPassengers = async (req, res) => {
  try {
    const passengers = await userRepo.listPassengers();
    res.json(passengers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePassenger = async (req, res) => {
  try {
    const { passengerId } = req.params;
    await userRepo.deleteUser(passengerId);
    res.json({ message: "Passenger deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= FEEDBACK =================
const getFeedback = async (req, res) => {
  try {
    const admin = require("../config/firebase");
    const snapshot = await admin.firestore()
      .collection("feedback")
      .orderBy("createdAt", "desc")
      .get();

    const feedbackList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(feedbackList);
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
  deleteDriver,
  updateDriverStatus,
  listPassengers,
  deletePassenger,
  getFeedback,
  detectStops
};