const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
const Classroom = require("../models/Classroom");
const { createNotification } = require("../utils/notification");

exports.createAssignment = async (req, res) => {
  try {
    // ================= ROLE CHECK =================
    if (req.user.role !== "teacher") {
      return res
        .status(403)
        .json({ msg: "Only teacher can create assignments" });
    }

    const {
      classId,
      title,
      description,
      deadline,
      endTime,
      maxMarks,
      attachments,
    } = req.body;

    // ================= REQUIRED FIELDS =================
    if (!classId || !title || !deadline || !endTime) {
      return res
        .status(400)
        .json({ msg: "Class ID, Title & Due Date are required" });
    }

    // ================= TITLE VALIDATION =================
    const titleWordCount = title.trim().split(/\s+/).length;
    if (titleWordCount > 10) {
      return res
        .status(400)
        .json({ msg: "Title must not exceed 10 words" });
    }

    // ================= DESCRIPTION VALIDATION =================
    if (description && description.trim()) {
      const descWordCount = description.trim().split(/\s+/).length;
      if (descWordCount > 30) {
        return res
          .status(400)
          .json({ msg: "Description must not exceed 30 words" });
      }
    }

    // ================= DEADLINE VALIDATION =================
    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ msg: "Invalid deadline format" });
    }

    if (parsedDeadline.getTime() <= Date.now()) {
      return res
        .status(400)
        .json({ msg: "Deadline must be a future date" });
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(endTime)) {
      return res.status(400).json({
        msg: "Invalid end time format (HH:mm)",
      });
    }

    // ================= MAX MARKS VALIDATION =================
    let parsedMaxMarks = 100;

    if (maxMarks !== undefined && maxMarks !== "") {
      parsedMaxMarks = Number(maxMarks);

      if (
        Number.isNaN(parsedMaxMarks) ||
        parsedMaxMarks < 1 ||
        parsedMaxMarks > 100
      ) {
        return res
          .status(400)
          .json({ msg: "Max marks must be between 1 and 100" });
      }
    }

    // ================= ATTACHMENTS VALIDATION =================
    if (Array.isArray(attachments) && attachments.length > 5) {
      return res
        .status(400)
        .json({ msg: "Maximum 5 attachments allowed" });
    }

    // ================= CLASSROOM CHECK =================
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ msg: "Invalid Classroom ID" });
    }

    const classroom = await Classroom.findById(classId);
    if (!classroom) {
      return res.status(404).json({ msg: "Classroom not found" });
    }

    if (classroom.teacher.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ msg: "You are not the teacher of this class" });
    }

    // ================= CREATE ASSIGNMENT =================
    const assignment = await Assignment.create({
      classroom: classId,
      title,
      description,
      deadline: parsedDeadline,
      endTime,
      maxMarks: parsedMaxMarks,
      attachments: Array.isArray(attachments)
        ? attachments.filter(Boolean)
        : [],
    });

    // ================= SEND NOTIFICATION =================
    if (classroom.students && classroom.students.length > 0) {
      await createNotification({
        title: "New Assignment Posted",
        message: `${title} assignment has been posted.`,
        users: classroom.students,
        role: "student",
        createdBy: req.user._id,
        type: "assignment",
        link: `/assignments/${classId}`
      });
    }

    res.status(201).json(assignment);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        msg: Object.values(err.errors)[0].message,
      });
    }

    console.error("Create Assignment Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ msg: "Invalid Classroom ID" });
    }

    const assignments = await Assignment.find({ classroom: classId })
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    console.error("Get Assignments Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, endTime, maxMarks, attachments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ msg: "Invalid Assignment ID" });

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

    // Check teacher owns classroom
    const classroom = await Classroom.findById(assignment.classroom);
    if (!classroom) return res.status(404).json({ msg: "Classroom not found" });
    if (req.user._id.toString() !== classroom.teacher.toString())
      return res.status(403).json({ msg: "You are not the teacher of this class" });
    

    // Update only allowed fields (do NOT touch classroom!)
    assignment.title = title || assignment.title;
    assignment.description = description || assignment.description;
    assignment.deadline = deadline || assignment.deadline;
    assignment.endTime = endTime || assignment.endTime;
    assignment.maxMarks = maxMarks || assignment.maxMarks;
    assignment.attachments = attachments || assignment.attachments;

    if (endTime) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(endTime)) {
        return res.status(400).json({
          msg: "Invalid end time format (HH:mm)",
        });
      }
    }

    const updated = await assignment.save();

    //================= NOTIFY STUDENTS =================
    if (classroom.students?.length) {
      await createNotification({
        title: "Assignment Updated",
        message: `${updated.title} has been updated by teacher.`,
        users: classroom.students,
        role: "student",
        createdBy: req.user._id,
        type: "assignment",
        link: `/assignments/${id}`
      });
    }
    res.json(updated);
  } catch (err) {
    console.error("Update Assignment Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ msg: "Invalid Assignment ID" });

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

    const classroom = await Classroom.findById(assignment.classroom);
    if (!classroom) return res.status(404).json({ msg: "Classroom not found" });
    if (req.user._id.toString() !== classroom.teacher.toString())
      return res.status(403).json({ msg: "You are not the teacher of this class" });

    // ================= NOTIFY STUDENTS =================
    // if (classroom.students?.length) {
    //   await createNotification({
    //     title: "Assignment Removed",
    //     message: `${assignment.title} assignment has been deleted.`,
    //     users: classroom.students,
    //     role: "student",
    //     createdBy: req.user._id,
    //     type: "assignment",
    //   });
    // }

    await Assignment.findByIdAndDelete(id);

    res.json({ msg: "Assignment deleted" });
  } catch (err) {
    console.error("Delete Assignment Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
