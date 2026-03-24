const admin = require("../config/firebase");

const busesCol = admin.firestore().collection("ScheduledBuses");
const routesCol = admin.firestore().collection("routes");

const serverTs = () => admin.firestore.FieldValue.serverTimestamp();

let busCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000;


// =============================
// HELPER FUNCTIONS
// =============================
const getDriverUidByLicense = async (licenseNumber) => {
  const snapshot = await admin.firestore().collection("users")
    .where("role", "==", "driver")
    .where("LicenseNumber", "==", licenseNumber)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data().uid;
};

const getRouteIdByNumber = async (routeNumber) => {
  const snapshot = await routesCol
    .where("name", "==", routeNumber)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].id;
};

// =============================
// CREATE BUS (ADMIN)
// =============================
const createBus = async ({
  plateNumber,
  capacity,
  routeNumber,
  driverLicense,
  date,
  status = "scheduled",
  starttime,
  endtime
}) => {

  const driverUid = await getDriverUidByLicense(driverLicense);
  if (!driverUid) throw new Error("Driver not found with that license number");

  // 🔹 Resolve route ID
  const routeId = await getRouteIdByNumber(routeNumber);
  if (!routeId) throw new Error("Route not found with that route number");

  // 🔥 Get stops from route automatically
  const routeDoc = await routesCol.doc(routeId).get();
  const stops = routeDoc.exists ? routeDoc.data().stops : [];
  if (!routeDoc.exists) {
    throw new Error("Route not found");
  }

  const routeData = routeDoc.data();

  const payload = {
    plateNumber,
    capacity,
    routeNumber,
    driverLicense,
    date,
    status,
    stops: routeData.stops || [],
    starttime,
    endtime,
    stops,
    createdAt: serverTs()
  };

  const ref = await busesCol.add(payload);
  const snap = await ref.get();

  return { id: ref.id, ...snap.data() };
};


// =============================
// GET BUS BY ID
// =============================
const getBusById = async (busId) => {
  const snap = await busesCol.doc(busId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
};


// =============================
// UPDATE BUS LOCATION (DRIVER)
// =============================
const updateBusLocation = async (
  busId,
  { latitude, longitude, speedKph, headingDeg }
) => {

  await busesCol.doc(busId).update({
    currentLatitude: latitude,
    currentLongitude: longitude,
    speedKph,
    headingDeg,
    lastPingAt: serverTs(),
    updatedAt: serverTs()
  });

  return getBusById(busId);
};


// =============================
// UPDATE BUS DETAILS (ADMIN)
// =============================
const updateBusDetails = async (
  busId,
  { plateNumber, capacity, routeId, driverUid, date, status, starttime, endtime }
) => {

  const updatePayload = {};


  if (plateNumber) updatePayload.plateNumber = plateNumber;
  if (capacity) updatePayload.capacity = capacity;
  if (driverUid) updatePayload.driverUid = driverUid;
  if (date) updatePayload.date = date;
  if (status) updatePayload.status = status;
  if (starttime) updatePayload.starttime = starttime;
  if (endtime) updatePayload.endtime = endtime;
  // If route changed → reload stops
  if (routeId) {
    const routeDoc = await routesCol.doc(routeId).get();
    if (!routeDoc.exists) throw new Error("Route not found");

    updatePayload.routeId = routeId;
    updatePayload.stops = routeDoc.data().stops || [];
  }

  updatePayload.updatedAt = serverTs();

  await busesCol.doc(busId).update(updatePayload);

  return getBusById(busId);
};


// =============================
// DELETE BUS (ADMIN)
// =============================
const deleteBus = async (busId) => {
  await busesCol.doc(busId).delete();
  await admin.database().ref(`busLocations/${busId}`).remove();
  return true;
};


// =============================
// GET ALL BUSES (with caching)
// =============================
const getAllBuses = async (date) => {

  const now = Date.now();

  if (!busCache || now - cacheTimestamp > CACHE_TTL) {

    const snapshot = await busesCol
      .where("date", "==", date)
      .where("status", "in", ["scheduled", "active"])
      .get();

    busCache = snapshot.docs.map(doc => {

      const bus = doc.data();

      const stopMap = {};

      bus.stops?.forEach((s, i) => {
        stopMap[s.name.toLowerCase()] = i;
      });

      return {
        id: doc.id,
        ...bus,
        stopMap
      };
    });

    cacheTimestamp = now;
  }

  return busCache;
};


// =============================
// FIND DIRECT BUSES
// =============================
const findDirectBuses = async ({
  from,
  to,
  date,
  lat,
  lng,
  radiusKm = 0.5
}) => {

  const buses = await getAllBuses(date);
  const results = [];

  for (const bus of buses) {

    const { stopMap, stops } = bus;

    let startIndex = stopMap[from.toLowerCase()];
    const endIndex = stopMap[to.toLowerCase()];

    if (
      startIndex === undefined ||
      endIndex === undefined ||
      startIndex >= endIndex
    ) continue;

    // nearest boarding stop
    if (lat != null && lng != null) {

      const nearestIndex = stops.findIndex(
        s => haversineKm(lat, lng, s.lat, s.lng) <= radiusKm
      );

      if (nearestIndex >= 0 && nearestIndex < endIndex) {
        startIndex = nearestIndex;
      }
    }

    results.push({
      id: bus.id,
      plateNumber: bus.plateNumber,
      stops,
      boardingStop: stops[startIndex],
      destinationStop: stops[endIndex],
      transfers: 0,
      estimatedDistanceKm: haversineKm(
        stops[startIndex].lat,
        stops[startIndex].lng,
        stops[endIndex].lat,
        stops[endIndex].lng
      )
    });
  }

  return results;
};


// =============================
// FIND MULTI BUS ROUTES
// =============================
const findMultiBusRoutes = async ({
  from,
  to,
  date,
  maxTransfers = 3,
  lat = null,
  lng = null,
  radiusKm = 0.5
}) => {

  const buses = await getAllBuses(date);

  const graph = {};

  // Build stop graph
  buses.forEach(bus => {

    for (let i = 0; i < bus.stops.length - 1; i++) {

      const stopA = bus.stops[i].name.toLowerCase();
      const stopB = bus.stops[i + 1].name.toLowerCase();

      if (!graph[stopA]) graph[stopA] = [];

      graph[stopA].push({
        to: stopB,
        busId: bus.id
      });
    }
  });

  const queue = [{
    path: [],
    stop: from.toLowerCase(),
    transfers: 0
  }];

  const routes = [];

  while (queue.length) {

    const current = queue.shift();

    if (current.transfers > maxTransfers) continue;

    if (current.stop === to.toLowerCase()) {
      routes.push(current.path);
      continue;
    }

    const neighbors = graph[current.stop] || [];

    neighbors.forEach(n => {

      queue.push({
        path: [...current.path, {
          busId: n.busId,
          from: current.stop,
          to: n.to
        }],
        stop: n.to,
        transfers: current.transfers + 1
      });

    });
  }

  // rank by transfers
  routes.sort((a, b) => a.length - b.length);

  const transformed = [];

  for (const route of routes) {

    const busesData = [];

    for (const segment of route) {

      const busInfo = await getBusById(segment.busId);

      const boardingStop =
        busInfo.stops.find(s =>
          s.name.toLowerCase() === segment.from
        );

      const destinationStop =
        busInfo.stops.find(s =>
          s.name.toLowerCase() === segment.to
        );

      busesData.push({
        busId: busInfo.id,
        busNumber: busInfo.plateNumber,
        boardingStop,
        destinationStop,
        stops: busInfo.stops
      });
    }

    transformed.push({
      transfers: route.length - 1,
      buses: busesData
    });
  }

  return transformed;
};


// =============================
// FIND ROUTES FOR PASSENGER
// =============================
const findRoutesForPassenger = async ({
  from,
  to,
  date,
  lat = null,
  lng = null
}) => {

  const direct = await findDirectBuses({
    from,
    to,
    date,
    lat,
    lng
  });

  if (direct.length) return direct;

  return findMultiBusRoutes({
    from,
    to,
    date,
    lat,
    lng
  });
};


// =============================
// HELPER: HAVERSINE
// =============================
const haversineKm = (lat1, lon1, lat2, lon2) => {

  const R = 6371;

  const toRad = deg => deg * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};


module.exports = {
  createBus,
  getBusById,
  updateBusLocation,
  updateBusDetails,
  deleteBus,
  findRoutesForPassenger
};