const admin = require("firebase-admin");
const serviceAccount = require( "../busguiderapp-2ed8d-firebase-adminsdk-fbsvc-c05b213692.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
