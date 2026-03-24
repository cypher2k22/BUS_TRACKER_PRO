const admin = require("../config/firebase");
const { getUserByUid } = require("./user.repo");
const { scheduleDateKeyFromStored } = require("../utils/scheduleDate");
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
  // Single-field query avoids requiring a composite index on (driverUid, date).
  let snapshot = await tripsCol.where("driverUid", "==", driverUid).get();
  let forDriver = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  if (forDriver.length === 0) {
    const profile = await getUserByUid(driverUid);
    const lic =
      profile && profile.LicenseNumber != null
        ? String(profile.LicenseNumber).trim()
        : "";
    if (lic) {
      snapshot = await tripsCol.where("driverLicense", "==", lic).get();
      forDriver = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  }

  const rows = forDriver.filter((t) => scheduleDateKeyFromStored(t.date) === date);
  return rows;
};

module.exports = { getTripById, updateTrip, getTripsByDriverAndDate };