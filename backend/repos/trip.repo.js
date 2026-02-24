const admin = require("../config/firebase");
const tripsCol = admin.firestore().collection("ScheduledBuses");

const getTripById = async (tripId) => {
  const doc = await tripsCol.doc(tripId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

const updateTrip = async (tripId, data) => {
  await tripsCol.doc(tripId).update({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  return getTripById(tripId);
};

const getTripsByDriverAndDate = async (driverUid, date) => {
  const snapshot = await tripsCol
    .where("driverUid", "==", driverUid)
    .where("date", "==", date)
    .get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

module.exports = { getTripById, updateTrip, getTripsByDriverAndDate };