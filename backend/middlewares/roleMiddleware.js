const admin = require("../config/firebase");

const authorizeRole = (allowedRoles) => {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error("authorizeRole requires at least one allowed role");
  }

  return async (req, res, next) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userDoc = await admin.firestore().collection("users").doc(uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({ message: "User not found" });
      }

      const userRole = userDoc.data().role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.userRole = userRole;
      next();
    } catch (error) {
      console.error("ROLE AUTH ERROR:", error.message);
      res.status(500).json({ message: "Unable to verify user role" });
    }
  };
};

module.exports = authorizeRole;
