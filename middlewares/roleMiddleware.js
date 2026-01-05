// middleware/roleMiddleware.js
const admin = require("../config/firebase");

const authorizeRole = (allowedRoles) => {
  return async (req, res, next) => {
    const uid = req.user.uid;

    const userDoc = await admin.firestore()
      .collection("users")
      .doc(uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userRole = userDoc.data().role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

module.exports = authorizeRole;
