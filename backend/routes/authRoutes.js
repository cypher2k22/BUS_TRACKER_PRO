const express = require('express');
const { signup, getProfile } = require("../controllers/authController");

const authorizeRole = require("../middlewares/roleMiddleware");
const authenticateUser = require("../middlewares/authMiddleware");

const router = express.Router();

router.post('/signup', signup);
router.get("/getprofile", authenticateUser, getProfile);

module.exports = router;