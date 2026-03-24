const admin = require("../config/firebase");
const fstore = admin.firestore();
const USERS_COLLECTION = "users";

const createUser = async ({ username, email, password, role, NICNumber, LicenseNumber }) => {
  let userRecord;
  try {
    userRecord = await admin.auth().createUser({ email, password, displayName: username });
  } catch (err) {
    throw err;
  }

  try {
    await fstore.collection(USERS_COLLECTION).doc(userRecord.uid).set({
      uid: userRecord.uid,
      username,
      email,
      role,
      ...(role === "driver" && { NICNumber, LicenseNumber }),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (err) {
    // Rollback Auth user creation if Firestore fails
    await admin.auth().deleteUser(userRecord.uid);
    throw err;
  }

  return userRecord.uid;
};

const getUserByUid = async (uid) => {
  const doc = await fstore.collection(USERS_COLLECTION).doc(uid).get();
  return doc.exists ? doc.data() : null;
};

const listDrivers = async () => {
  const snapshot = await fstore.collection(USERS_COLLECTION).where("role", "==", "driver").get();
  return snapshot.docs.map(doc => doc.data());
};

const listPassengers = async () => {
  const snapshot = await fstore.collection(USERS_COLLECTION).where("role", "==", "passenger").get();
  return snapshot.docs.map(doc => doc.data());
};

const deleteUser = async (uid) => {
  // Delete from Auth
  await admin.auth().deleteUser(uid);
  // Delete from Firestore
  await fstore.collection(USERS_COLLECTION).doc(uid).delete();
  return true;
};

const toggleUserStatus = async (uid, isDisabled) => {
  await admin.auth().updateUser(uid, { disabled: isDisabled });
  await fstore.collection(USERS_COLLECTION).doc(uid).update({
    status: isDisabled ? "disabled" : "active"
  });
  return true;
};

module.exports = { createUser, getUserByUid, listDrivers, listPassengers, deleteUser, toggleUserStatus };