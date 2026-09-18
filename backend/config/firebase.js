const admin = require("firebase-admin");
const path = require("path");

if (!admin.apps.length) {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      : path.join(__dirname, "../firebase-service-account.json");

    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL:
        process.env.FIREBASE_DATABASE_URL ||
        "https://busguiderapp-2ed8d-default-rtdb.asia-southeast1.firebasedatabase.app",
    });

    console.log("🚀 Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Firebase initialization error:", error.message);
  }
}

module.exports = admin;
