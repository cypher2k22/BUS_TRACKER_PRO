// middleware/authMiddleware.js
const admin = require("../config/firebase");

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] === "undefined" || authHeader.split(" ")[1] === "null") {
      return res.status(401).json({ message: "Unauthorized: Missing, improperly formatted, or invalid token" });
    }

    const idToken = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    req.user = decodedToken; // attach user to request
    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = authenticateUser;
