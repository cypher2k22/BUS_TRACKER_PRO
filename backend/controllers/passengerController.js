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
// GET BUS LIVE LOCATION
// =======================================

const searchbuses = async (req, res) => {
    try {
        const { from, to, date, starttime, endtime } = req.query;
        
        if (!from || !to || !date) {
            return res.status(400).json({ message: "From, To and Date are required" });
        }

        // Fetch buses for the specific date
        const snapshot = await admin.firestore()
            .collection("ScheduledBuses")
            .where("date", "==", date)
            .where("status", "in", ["scheduled", "active"])
            .get();

        let buses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Filter based on stops with First Letter Capitalization safety
        buses = buses.filter(bus => {
            const stops = bus.stops || [];
            
            // Trim spaces and ensure comparison ignores minor casing accidents
            const startIndex = stops.findIndex(s => s.trim().toLowerCase() === from.trim().toLowerCase());
            const endIndex = stops.findIndex(s => s.trim().toLowerCase() === to.trim().toLowerCase());

            // Logic: Both stops must exist and 'from' must be before 'to'
            return startIndex >= 0 && endIndex >= 0 && startIndex < endIndex;
        });

        // Time filtering (Optional)
        if (starttime && endtime) {
            buses = buses.filter(bus => {
                const busStart = bus.starttime;
                return busStart >= starttime && busStart <= endtime;
            });
        }

        res.status(200).json({ buses });
    } catch (error) {
        console.error("SEARCH ERROR ", error);
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
  getBusLiveLocation
};