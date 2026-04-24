const router = require("express").Router();
const {
  register,
  login,
  updateProfile,
  updatePassword,
  // verifyOTP,
  // resendOTP
} = require("../controllers/authController");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");;

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Get logged user
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// Update profile
router.patch("/update-profile", auth, updateProfile);

// Update password
router.patch("/update-password", auth, updatePassword);

// router.post("/verify-otp", verifyOTP);
// router.post("/resend-otp", resendOTP);

module.exports = router;
