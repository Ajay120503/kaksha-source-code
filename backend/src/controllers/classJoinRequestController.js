const ClassJoinRequest = require("../models/ClassJoinRequest");
const { createNotification } = require("../utils/notification");

/* ===== GET TEACHER REQUESTS ===== */
exports.getJoinRequests = async (req, res) => {
  const requests = await ClassJoinRequest.find()
    .populate("student", "name email")
    .populate("classroom", "name teacher");

  const teacherRequests = requests.filter(
    r =>
      r.classroom.teacher.toString() === req.user._id.toString()
  );

  res.json(teacherRequests);
};

exports.approveJoinRequest = async (req, res) => {
  const request = await ClassJoinRequest.findById(req.params.id)
    .populate("classroom")
    .populate("student");

  if (!request || request.status !== "pending")
    return res.status(400).json({ msg: "Invalid request" });

  request.classroom.students.push(request.student._id);
  await request.classroom.save();

  request.status = "approved";
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();
  await request.save();

  await createNotification({
    title: "Join Approved",
    message: `You joined "${request.classroom.name}"`,
    users: [request.student._id],
    role: "student",
    createdBy: req.user._id,
    type: "class_join",
  });

  res.json({ msg: "Student approved" });
};

exports.rejectJoinRequest = async (req, res) => {
  const request = await ClassJoinRequest.findById(req.params.id)
    .populate("classroom")
    .populate("student");

  if (!request)
    return res.status(404).json({ msg: "Request not found" });

  request.status = "rejected";
  request.reviewedBy = req.user._id;
  request.reviewedAt = new Date();

  await request.save();

  await createNotification({
    title: "Request Rejected",
    message: `Your request to join "${request.classroom.name}" was rejected.`,
    users: [request.student._id],
    role: "student",
    createdBy: req.user._id,
    type: "class_join",
  });

  res.json({ msg: "Request rejected" });
};

exports.deleteJoinRequest = async (req, res) => {
  await ClassJoinRequest.findByIdAndDelete(req.params.id);

  res.json({ msg: "Request deleted" });
};

/* ===== GET PENDING REQUEST COUNT FOR TEACHER ===== */

exports.getJoinRequestCount = async (req, res) => {
  try {
    const requests = await ClassJoinRequest.find()
      .populate("classroom", "teacher");

    const count = requests.filter(
      r =>
        r.status === "pending" &&
        r.classroom.teacher.toString() === req.user._id.toString()
    ).length;

    res.json({ count });
  } catch (error) {
    console.error("Join request count error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};