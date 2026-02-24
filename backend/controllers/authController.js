const userRepo = require("../repos/user.repo");

const signup = async (req, res) => {
  try {
    const { username, email, password, role, NICNumber, LicenseNumber } = req.body;

    // Validation here...

    const uid = await userRepo.createUser({ username, email, password, role, NICNumber, LicenseNumber });
    res.status(201).json({ message: "User created successfully", uid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userRepo.getUserByUid(req.user.uid);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Profile fetched", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, getProfile };