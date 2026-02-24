const admin = require("../config/firebase");
const fstore = admin.firestore();
const USERS_COLLECTION = "users";

const createUser = async ({ username, email, password, role, NICNumber, LicenseNumber }) => {
  const userRecord = await admin.auth().createUser({ email, password, displayName: username });
  
  await fstore.collection(USERS_COLLECTION).doc(userRecord.uid).set({
    uid: userRecord.uid,
    username,
    email,
    role,
    ...(role === "driver" && { NICNumber, LicenseNumber }),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return userRecord.uid;
};

const getUserByUid = async (uid) => {
  const doc = await fstore.collection(USERS_COLLECTION).doc(uid).get();
  return doc.exists ? doc.data() : null;
};

module.exports = { createUser, getUserByUid };