const admin = require('../config/firebase');

const INTERVAL_MS = 10000;
const activeTrackers = new Map(); // driverUid -> { timer, tripId }

// Helper: get trip document by ID
const getTrip = async (tripId) => {
  const tripDoc = await admin.firestore().collection('ScheduledBuses').doc(tripId).get();
  if (!tripDoc.exists) throw new Error('Trip not found');
  return { id: tripDoc.id, ...tripDoc.data() };
};

// 1️⃣ Get driver’s trips for today
const getTodayTrips = async (req, res) => {
  try {
    const driverUid = req.user.uid;
     console.log("Driver UID:", driverUid);
     const todayDate = new Date(); // local time
    const yyyy = todayDate.getFullYear();
    const mm = String(todayDate.getMonth() + 1).padStart(2, '0'); 
    const dd = String(todayDate.getDate()).padStart(2, '0');
    const today = `${yyyy}-${mm}-${dd}`; //
    console.log("Local today:", today);
    
    const snapshot = await admin.firestore()
      .collection('ScheduledBuses')
      .where('driverUid', '==', driverUid)
      .where('date', '==', today)
      .get();

      console.log("Number of trips found:", snapshot.size);
    const trips = snapshot.docs.map(doc => {
      console.log("tri id:",doc.id);
      return {
       id: doc.id, ...doc.data() };
    });
    res.status(200).json({ trips });
  } catch (err) {
    console.error('Get trips error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2️⃣ Start trip
const startTrip = async (req, res) => {
  try {

   
    const { tripId } = req.params;
    let trip;
    try{
      trip = await getTrip(tripId);
    } catch (err) {
      return res.status(404).json({ message: "Trip not found" });
    }
    
     if (trip.driverUid !== req.user.uid) {
  return res.status(403).json({ message: "Not authorized" });
}
    await admin.firestore().collection('ScheduledBuses').doc(tripId).update({ status: 'active' });

    res.status(200).json({ message: 'Trip started', tripId });
  } catch (err) {
    console.error('Start trip error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3️⃣ Ping live location
const pingLocation = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { latitude, longitude, speedKph, headingDeg } = req.body;
    const trip = await getTrip(tripId);

    const locationData = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      speedKph: speedKph != null ? Number(speedKph) : null,
      headingDeg: headingDeg != null ? Number(headingDeg) : null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      driverUid: req.user.uid
    };

    await admin.firestore().collection('busLocations').doc(tripId).set(locationData);

    res.status(200).json({ message: 'Location updated', tripId });
  } catch (err) {
    console.error('Ping location error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 4️⃣ Stop trip
const stopTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
        const trip = await getTrip(tripId);
        if (trip.driverUid !== req.user.uid) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await admin.firestore().collection('ScheduledBuses').doc(tripId).update({ status: 'completed' });

    const tracker = activeTrackers.get(req.user.uid);
    if (tracker?.timer) clearInterval(tracker.timer);
    activeTrackers.delete(req.user.uid);

    res.status(200).json({ message: 'Trip stopped', tripId });
  } catch (err) {
    console.error('Stop trip error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 5️⃣ Get tracking status
const getStatus = (req, res) => {
  const tracker = activeTrackers.get(req.user.uid);
  if (!tracker) return res.status(200).json({ running: false });

  res.status(200).json({
    running: true,
    tripId: tracker.tripId,
    intervalMs: INTERVAL_MS
  });
};

module.exports = {
  getTodayTrips,
  startTrip,
  pingLocation,
  stopTrip,
  getStatus
};