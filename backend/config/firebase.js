const admin = require("firebase-admin");
const path = require("path");

if (!admin.apps.length) {
  const serviceAccount = require(path.join(
    __dirname,
    "../busguiderapp-2ed8d-firebase-adminsdk-fbsvc-c05b213692.json"
  ));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
