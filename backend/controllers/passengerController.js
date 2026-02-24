const admin = require("../config/firebase");

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

        const busDoc = await admin.firestore().collection("ScheduledBuses").doc(busId).get();
        if (!busDoc.exists) {
            return res.status(404).json({ message: "Bus not found" });
        }
        const busData = busDoc.data();
         const locationSnap = await admin.database().ref(`buslocations/${busId}`).get();
        if (!locationSnap.exists) {
            return res.status(404).json({ message: "Location not found" });
        }
        const locationData = locationSnap.val();

        res.status(200).json({
            busId,
            busNumber: busData.busNumber,
            busRoute: busData.busRoute,
            startingLocation: busData.startingLocation,
            destination: busData.destination,
            stops: busData.stops,
            driverUid: busData.driverUid,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            speedKph: locationData.speedKph,
            headingDeg: locationData.headingDeg,
            updatedAt: locationData.updatedAt
        });
    } catch (error) {
        console.error("GET LOCATION ERROR ", error);
        res.status(500).json({ message: "Server error" });
    }
};
 

const getRoutePolyline = async (req, res) => {
  try {
    const { busId } = req.params;

    const busDoc = await admin.firestore().collection("ScheduledBuses").doc(busId).get();
    if (!busDoc.exists) return res.status(404).json({ message: "Bus not found" });
    const busData = busDoc.data();

    const stops = busData.stops || [];
    if (stops.length < 2) return res.status(400).json({ message: "Not enough stops to generate route" });

    const origin = stops[0];
    const destination = stops[stops.length - 1];
    const waypoints = stops.slice(1, -1);

    res.status(200).json({ origin, destination, waypoints });
  } catch (err) {
    console.error("Get route polyline error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  searchbuses,
  getBusLiveLocation,
  getRoutePolyline
};
