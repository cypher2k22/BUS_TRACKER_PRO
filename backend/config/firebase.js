const admin = require("firebase-admin");
const path = require("path");

if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.join(
      __dirname,
      "../busguiderapp-2ed8d-firebase-adminsdk-fbsvc-c05b213692.json"
    );

    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Ensure the URL matches your Firebase Console exactly
      databaseURL: "https://busguiderapp-2ed8d-default-rtdb.asia-southeast1.firebasedatabase.app"
    });
    console.log("🚀 Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Firebase initialization error:", error.message);
  }
}

module.exports = admin;
