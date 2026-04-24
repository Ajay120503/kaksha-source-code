const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { createNotification } = require("../utils/notification");
// const crypto = require("crypto");
// const { sendOTPEmail } = require("../utils/sendOTP");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists)
      return res
        .status(400)
        .json({ message: "User already exists with this email" });

    // Prevent normal users from force-registering as teacher
    const allowedRoles = ["student", "teacher"];
    const userRole = allowedRoles.includes(role) ? role : "student";

    const user = await User.create({
      name,
      email,
      password,
      role: userRole
    });

    /* ================= ADMIN NOTIFICATION ================= */

    // get all admins
    const admins = await User.find({ role: "admin" }).select("_id");

    if (admins.length) {
      await createNotification({
        title: "New User Registration",
        message: `${user.name} registered as ${user.role}.`,
        users: admins.map((a) => a._id),
        role: "admin",
        createdBy: user._id,
        type: "system",
      });
    }

    /* ====================================================== */

    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Email already registered. Please login." });
    }

    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     const exists = await User.findOne({ email });
//     if (exists)
//       return res.status(400).json({ message: "Email already registered" });

//     const allowedRoles = ["student", "teacher"];
//     const userRole = allowedRoles.includes(role) ? role : "student";

//     /* ===== CREATE OTP ===== */
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     const hashedOTP = crypto
//       .createHash("sha256")
//       .update(otp)
//       .digest("hex");

//     const user = await User.create({
//       name,
//       email,
//       password,
//       role: userRole,
//       otpCode: hashedOTP,
//       otpExpire: Date.now() + 10 * 60 * 1000, // 10 min
//       isVerified: false,
//     });

//     /* ===== SEND EMAIL ===== */
//     await sendOTPEmail(email, otp);

//     res.status(201).json({
//       message: "OTP sent to email. Please verify account.",
//       email,
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Registration failed" });
//   }
// };

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // if (!user.isVerified)
    //   return res.status(401).json({
    //   message: "Please verify your email first",
    // });

    const token = generateToken(user);

    if (user.role === "teacher") {
      const admins = await User.find({ role: "admin" }).select("_id");

      await createNotification({
        title: "Teacher Login",
        message: `${user.name} logged into the system.`,
        users: admins.map(a => a._id),
        role: "admin",
        createdBy: user._id,
        type: "system",
      });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};

// exports.verifyOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const hashedOTP = crypto
//       .createHash("sha256")
//       .update(otp)
//       .digest("hex");

//     const user = await User.findOne({
//       email,
//       otpCode: hashedOTP,
//       otpExpire: { $gt: Date.now() },
//     });

//     if (!user)
//       return res.status(400).json({ message: "Invalid or expired OTP" });

//     user.isVerified = true;
//     user.otpCode = undefined;
//     user.otpExpire = undefined;

//     await user.save();

//     const token = generateToken(user);

//     res.json({
//       message: "Account verified successfully",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });

//   } catch {
//     res.status(500).json({ message: "OTP verification failed" });
//   }
// };

// exports.resendOTP = async (req, res) => {
//   const { email } = req.body;

//   const user = await User.findOne({ email });

//   if (!user)
//     return res.status(404).json({ message: "User not found" });

//   if (user.isVerified)
//     return res.status(400).json({ message: "Already verified" });

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   user.otpCode = crypto
//     .createHash("sha256")
//     .update(otp)
//     .digest("hex");

//   user.otpExpire = Date.now() + 10 * 60 * 1000;

//   await user.save();

//   await sendOTPEmail(email, otp);

//   res.json({ message: "OTP resent successfully" });
// };

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email)
      return res.status(400).json({ message: "Name and email required" });

    const user = await User.findById(req.user.id);

    // prevent email duplication
    if (email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists)
        return res.status(400).json({ message: "Email already in use" });
    }

    user.name = name;
    user.email = email;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "All fields required" });

    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    // SELECT password explicitly
    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch)
      return res.status(401).json({ message: "Current password incorrect" });

    user.password = newPassword; // hashed automatically in pre-save
    user.passwordChangedAt = new Date();
    await user.save();

    const admins = await User.find({ role: "admin" }).select("_id");

    await createNotification({
      title: "Password Updated",
      message: `${user.name} updated account password.`,
      users: admins.map(a => a._id),
      role: "admin",
      createdBy: user._id,
      type: "system",
    });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Update Password Error:", err);
    res.status(500).json({ message: "Password update failed" });
  }
};



