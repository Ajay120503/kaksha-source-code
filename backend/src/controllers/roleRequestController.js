const RoleRequest = require("../models/RoleRequest");
const User = require("../models/User");
const { createNotification } = require("../utils/notification");

/* ==============================
   STUDENT REQUEST TEACHER ROLE
================================ */
exports.requestTeacherRole = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user.role !== "student")
      return res.status(400).json({
        message: "Only students can request teacher role",
      });

    /* ===== PREVENT DUPLICATE ===== */

    const existing = await RoleRequest.findOne({
      user: userId,
      status: "pending",
    });

    if (existing)
      return res.status(400).json({
        message: "Request already pending",
      });

    /* ===== CREATE REQUEST ===== */

    const request = await RoleRequest.create({
      user: userId,
      requestedRole: "teacher",
    });

    /* ===== FIND ADMINS ===== */

    const admins = await User.find({ role: "admin" })
      .select("_id");

    const adminIds = admins.map(a => a._id);

    /* ===== CREATE NOTIFICATION ===== */

    await createNotification({
      title: "New Role Request",
      message: `${user.name} requested Teacher role`,
      users: adminIds,
      role: "admin",
      createdBy: userId,
      type: "role_request",
      link: "/120503/role-requests",
    });

    res.json({
      message: "Role request sent successfully",
      request,
    });

  } catch (err) {
    console.error("Role Request Error:", err);
    res.status(500).json({ message: "Request failed" });
  }
};

/* ================ ADMIN GET ALL REQUESTS ================ */

exports.getRoleRequests = async (req, res) => {
  try {
    const requests = await RoleRequest.find()
      .populate("user", "name email role")
      .populate("reviewedBy", "name");

    res.json(requests);
  } catch {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

/* ============== ADMIN APPROVE REQUEST ====================== */

// exports.approveRoleRequest = async (req, res) => {
//   try {
//     const request = await RoleRequest.findById(req.params.id)
//       .populate("user");

//     if (!request)
//       return res.status(404).json({ message: "Request not found" });

//     if (request.status !== "pending")
//       return res.status(400).json({
//         message: "Request already processed",
//       });

//     /* ===== UPDATE USER ROLE ===== */

//     request.user.role = "teacher";
//     await request.user.save();

//     /* ===== UPDATE REQUEST ===== */

//     request.status = "approved";
//     request.reviewedBy = req.user._id;
//     request.reviewedAt = new Date();

//     await request.save();

//     await createNotification({
//       title: "Role Approved",
//       message: "Your Teacher role request has been approved.",
//       users: [request.user._id],
//       role: "teacher",
//       createdBy: req.user._id,
//       type: "role_request",
//     });

//     res.json({ message: "Role approved successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Approval failed" });
//   }
// };

exports.approveRoleRequest = async (req, res) => {
  try {
    const request = await RoleRequest.findById(req.params.id)
      .populate("user");

    if (!request)
      return res.status(404).json({ message: "Request not found" });

    if (request.status !== "pending")
      return res.status(400).json({
        message: "Request already processed",
      });

    /* ===== BACKUP OLD ROLE ===== */

    const oldRole = request.user.role;

    try {

      /* ===== UPDATE USER ROLE ===== */

      request.user.role = "teacher";
      await request.user.save();

      /* ===== UPDATE REQUEST ===== */

      request.status = "approved";
      request.reviewedBy = req.user._id;
      request.reviewedAt = new Date();

      await request.save();

      await createNotification({
        title: "Role Approved",
        message: "Your Teacher role request has been approved.",
        users: [request.user._id],
        role: "teacher",
        createdBy: req.user._id,
        type: "role_request",
      });

      res.json({ message: "Role approved successfully" });

    } catch (err) {

      /* ===== RESTORE OLD ROLE IF ERROR ===== */

      request.user.role = oldRole;
      await request.user.save();

      throw err;
    }

  } catch (err) {
    console.error("Approval failed:", err);
    res.status(500).json({ message: "Approval failed" });
  }
};

/* ================= ADMIN REJECT REQUEST ==================== */

exports.rejectRoleRequest = async (req, res) => {
  try {
    const request = await RoleRequest.findById(req.params.id);

    if (!request)
      return res.status(404).json({ message: "Request not found" });

    if (request.status !== "pending")
      return res.status(400).json({
        message: "Already processed",
      });

    request.status = "rejected";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();

    await request.save();

    await createNotification({
      title: "Role Request Rejected",
      message: "Your teacher role request was rejected.",
      users: [request.user],
      role: "student",
      createdBy: req.user._id,
      type: "role_request",
    });

    res.json({ message: "Request rejected" });
  } catch {
    res.status(500).json({ message: "Reject failed" });
  }
};

exports.getMyRoleRequest = async (req, res) => {
  try {
    const request = await RoleRequest.findOne({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(request);
  } catch {
    res.status(500).json({ message: "Failed" });
  }
};

/* ================= ADMIN DELETE REQUEST ================= */

exports.deleteRoleRequest = async (req, res) => {
  try {
    const request = await RoleRequest.findById(req.params.id);

    if (!request)
      return res
        .status(404)
        .json({ message: "Request not found" });

    await request.deleteOne();

    res.json({
      message: "Role request deleted successfully",
    });
  } catch (err) {
    console.error("Delete Request Error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ================= ADMIN PENDING COUNT ================= */

exports.getPendingRoleRequestCount = async (req, res) => {
  try {
    const count = await RoleRequest.countDocuments({
      status: "pending",
    });

    res.json({ count });
  } catch {
    res.status(500).json({ message: "Failed to fetch count" });
  }
};