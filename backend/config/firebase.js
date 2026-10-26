const admin = require("firebase-admin");
const path = require("path");

if (!admin.apps.length) {
  try {
    // Render and other hosts commonly provide secrets as environment variables
    // rather than files. Support either a JSON env value or a local secret file.
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
        ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
        : path.join(__dirname, "../firebase-service-account.json");
      serviceAccount = require(serviceAccountPath);
    }

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
