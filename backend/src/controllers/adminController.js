const User = require("../models/User");
const Classroom = require("../models/Classroom");
const { createNotification } = require("../utils/notification");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Change user role
exports.changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowed = ["student", "teacher", "admin"];

    /* ================= VALIDATION ================= */

    if (!allowed.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // prevent self role change
    if (req.user.id === req.params.id) {
      return res
        .status(400)
        .json({ message: "Cannot change your own role" });
    }

    /* ================= FIND USER ================= */

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const oldRole = user.role;

    // avoid unnecessary update
    if (oldRole === role) {
      return res.status(400).json({
        message: "User already has this role",
      });
    }

    /* ================= UPDATE ROLE ================= */

    user.role = role;
    await user.save();

    /* ================= NOTIFICATION ================= */

    await createNotification({
      title: "Role Updated",
      message: `Your role has been changed from "${oldRole}" to "${role}" by admin.`,
      users: [user._id], // notify affected user
      role: role, // new role
      createdBy: req.user._id, // admin who changed
      type: "change_role",
      link: "/profile",
    });

    res.json({
      message: "Role updated successfully",
      user,
    });
  } catch (err) {
    console.error("Role update error:", err.message);
    res.status(500).json({ message: "Role update failed" });
  }
};

// Block / Unblock user
exports.toggleBlockUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id)
      return res.status(400).json({ message: "Cannot block yourself" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: user.isBlocked ? "User blocked" : "User unblocked",
    });
  } catch {
    res.status(500).json({ message: "Action failed" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id)
      return res.status(400).json({ message: "Cannot delete yourself" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ================= CLASSROOMS ================= */

exports.getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find()
      .populate("teacher", "name email")
      .populate("students", "name email");

    res.json(classrooms);
  } catch {
    res.status(500).json({ message: "Failed to fetch classrooms" });
  }
};

exports.deleteClassroom = async (req, res) => {
  try {
    await Classroom.findByIdAndDelete(req.params.id);
    res.json({ message: "Classroom removed" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};