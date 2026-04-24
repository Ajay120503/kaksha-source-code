const Classroom = require("../models/Classroom");
const User = require("../models/User");
const generateCode = require("../utils/generateCode");
const { createNotification } = require("../utils/notification");
const ClassJoinRequest = require("../models/ClassJoinRequest");

exports.createClass = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ msg: "Only teacher can create class" });
    }

    let code;
    let existing;

    do {
      code = generateCode();
      existing = await Classroom.findOne({ code });
    } while (existing);

    let { name, description } = req.body;

    // Trim values
    name = name?.trim();
    description = description?.trim();

    // -----------------------------
    // CLASS NAME VALIDATION
    // -----------------------------
    if (!name) {
      return res.status(400).json({ msg: "Class name is required" });
    }

    const nameWordCount = name.split(/\s+/).length;

    if (nameWordCount > 3) {
      return res.status(400).json({
        msg: "Class name must not exceed 8 words",
      });
    }

    if (name.length > 60) {
      return res.status(400).json({
        msg: "Class name must not exceed 60 characters",
      });
    }

    // -----------------------------
    // DESCRIPTION VALIDATION
    // -----------------------------
    if (description) {
      const descWordCount = description.split(/\s+/).length;

      if (descWordCount > 10) {
        return res.status(400).json({
          msg: "Description must not exceed 30 words",
        });
      }

      if (description.length > 300) {
        return res.status(400).json({
          msg: "Description must not exceed 300 characters",
        });
      }
    }

    // -----------------------------
    // CREATE CLASS
    // -----------------------------
    const classroom = await Classroom.create({
      name,
      description,
      code,
      teacher: req.user._id,
    });

    req.user.classroomsOwned.push(classroom._id);
    await req.user.save();

    // ================= NOTIFICATION =================
    // await createNotification({
    //   title: "Class Created",
    //   message: `Your class "${name}" has been created successfully.`,
    //   users: [req.user._id],
    //   role: "teacher",
    //   createdBy: req.user._id,
    //   type: "classroom",
    // });

    res.status(201).json(classroom);

  } catch (err) {
    console.error("Create Class Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// exports.joinClass = async (req, res) => {
//   try {
//     const { code } = req.body;

//     if (!code) return res.status(400).json({ msg: "Code is required" });

//     const classroom = await Classroom.findOne({ code });

//     if (!classroom)
//       return res.status(404).json({ msg: "Invalid classroom code" });

//     // Prevent teacher joining their own class
//     if (classroom.teacher.toString() === req.user._id.toString()) {
//       return res.status(400).json({ msg: "Teacher already owns this class" });
//     }

//     // BAN CHECK (NEW)
//     if (
//       classroom.bannedStudents &&
//       classroom.bannedStudents.some(
//         (id) => id.toString() === req.user._id.toString()
//       )
//     ) {
//       return res
//         .status(403)
//         .json({ msg: "You are banned from this classroom" });
//     }

//     // Prevent duplicate joining
//     const alreadyJoined = classroom.students.some(
//       (id) => id.toString() === req.user._id.toString()
//     );

//     if (alreadyJoined)
//       return res.status(400).json({ msg: "Already joined this classroom" });

//     // Add student
//     classroom.students.push(req.user._id);
//     await classroom.save();

//     // ================= NOTIFY TEACHER =================
//     await createNotification({
//       title: "New Student Joined",
//       message: `${req.user.name} joined your class "${classroom.name}".`,
//       users: [classroom.teacher],
//       role: "teacher",
//       createdBy: req.user._id,
//       type: "classroom",
//     });

//     res.json({ msg: "Joined successfully", classroom });
//   } catch (err) {
//     console.error("Join Class Error:", err.message);
//     res.status(500).json({ msg: "Server Error", error: err.message });
//   }
// };

exports.joinClass = async (req, res) => {
  try {
    const { code } = req.body;

    const classroom = await Classroom.findOne({ code });

    if (!classroom)
      return res.status(404).json({ msg: "Invalid classroom code" });

    // teacher cannot request
    if (classroom.teacher.toString() === req.user._id.toString())
      return res.status(400).json({ msg: "You own this class" });

    // already joined
    const alreadyJoined = classroom.students.includes(req.user._id);
    if (alreadyJoined)
      return res.status(400).json({ msg: "Already joined this classroom" });

    // already requested
    const existing = await ClassJoinRequest.findOne({
      classroom: classroom._id,
      student: req.user._id,
      status: "pending",
    });

    if (existing)
      return res.status(400).json({
        msg: "Join request already pending",
      });

    /* ===== CREATE REQUEST ===== */

    await ClassJoinRequest.create({
      classroom: classroom._id,
      student: req.user._id,
    });

    /* ===== NOTIFY TEACHER ===== */

    await createNotification({
      title: "Join Request",
      message: `${req.user.name} requested to join "${classroom.name}"`,
      users: [classroom.teacher],
      role: "teacher",
      createdBy: req.user._id,
      type: "class_join",
      link: "/join-requests",
    });

    res.json({ msg: "Join request sent to teacher" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.myClasses = async (req, res) => {
  try {
    const classes = await Classroom.find({
      $or: [
        { teacher: req.user._id },
        { students: req.user._id }
      ]
    }).populate("teacher students", "name email role");

    res.json(classes);
  } catch (err) {
    console.error("My Classes Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate("teacher students", "name email role")
      .populate("bannedStudents", "name email");

    if (!classroom) {
      return res.status(404).json({ msg: "Class not found" });
    }

    res.json(classroom);
  } catch (err) {
    console.error("Get classroom error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


exports.deleteClass = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ msg: "Class not found" });
    }

    // Only teacher who owns the class can delete
    if (classroom.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // Remove classroom from teacher's owned list
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { classroomsOwned: classroom._id } }
    );

    // Remove classroom from students' joined list (optional safety)
    await User.updateMany(
      { _id: { $in: classroom.students } },
      { $pull: { classroomsJoined: classroom._id } }
    );

    // ================= NOTIFY STUDENTS =================
    if (classroom.students?.length) {
      await createNotification({
        title: "Classroom Deleted",
        message: `Class "${classroom.name}" has been removed by teacher.`,
        users: classroom.students,
        role: "student",
        createdBy: req.user._id,
        type: "classroom",
      });
    }

    await classroom.deleteOne();

    res.json({ msg: "Classroom deleted successfully" });
  } catch (err) {
    console.error("Delete Class Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

exports.leaveClass = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ msg: "Class not found" });
    }

    // Teacher cannot leave own class
    if (classroom.teacher.toString() === req.user._id.toString()) {
      return res.status(400).json({ msg: "Teacher cannot leave their own class" });
    }

    // Check if student is enrolled
    const isStudent = classroom.students.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!isStudent) {
      return res.status(400).json({ msg: "You are not enrolled in this class" });
    }

    // Remove student from classroom
    classroom.students = classroom.students.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await classroom.save();

    // ================= NOTIFY TEACHER =================
    await createNotification({
      title: "Student Left Class",
      message: `${req.user.name} left "${classroom.name}".`,
      users: [classroom.teacher],
      role: "teacher",
      createdBy: req.user._id,
      type: "classroom",
    });

    await User.updateOne(
      { _id: req.user._id },
      { $pull: { classroomsJoined: classroom._id } }
    );

    res.json({ msg: "You left the classroom successfully" });
  } catch (err) {
    console.error("Leave Class Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// Ban student
exports.banStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    const classroom = await Classroom.findById(classId);
    if (!classroom) return res.status(404).json({ msg: "Classroom not found" });

    // Only teacher can ban
    if (classroom.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ msg: "Not authorized" });

    // Add to bannedStudents if not already
    if (!classroom.bannedStudents.includes(studentId)) {
      classroom.bannedStudents.push(studentId);
    }

    // Remove from current students if present
    classroom.students = classroom.students.filter(
      (id) => id.toString() !== studentId
    );

    await classroom.save();

    // ================= NOTIFY STUDENT =================
    await createNotification({
      title: "Removed From Classroom",
      message: `You have been removed from "${classroom.name}".`,
      users: [studentId],
      role: "student",
      createdBy: req.user._id,
      type: "classroom",
    });

    res.json({ msg: "Student banned successfully", classroom });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// Unban student
exports.unbanStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    const classroom = await Classroom.findById(classId);
    if (!classroom) return res.status(404).json({ msg: "Classroom not found" });

    // Only teacher can unban
    if (classroom.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ msg: "Not authorized" });

    // Remove from bannedStudents
    classroom.bannedStudents = classroom.bannedStudents.filter(
      (id) => id.toString() !== studentId
    );

    // AUTO-JOIN student back to classroom
    const alreadyJoined = classroom.students.some(
      (id) => id.toString() === studentId
    );

    if (!alreadyJoined) {
      classroom.students.push(studentId);
    }

    await classroom.save();

    // ================= NOTIFY STUDENT =================
    await createNotification({
      title: "Rejoined Classroom",
      message: `You are allowed back into "${classroom.name}".`,
      users: [studentId],
      role: "student",
      createdBy: req.user._id,
      type: "classroom",
    });

    res.json({ msg: "Student unbanned successfully", classroom });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};


