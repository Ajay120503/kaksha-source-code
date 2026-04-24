const mongoose = require("mongoose");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Classroom = require("../models/Classroom");
const { tfidfSimilarity } = require("../utils/plagiarism");
const { extractTextFromFile } = require("../utils/fileExtractor.js");
const { createNotification } = require("../utils/notification");
const Notification = require("../models/Notification");

// Student submits assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, fileUrl, fileType } = req.body;

    /* ================= VALIDATION ================= */

    if (!assignmentId || !fileUrl) {
      return res.status(400).json({
        msg: "Assignment ID and submission content required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ msg: "Invalid Assignment ID" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment)
      return res.status(404).json({ msg: "Assignment not found" });

    /* ================= DEADLINE CHECK ================= */

    const deadlineDate = new Date(assignment.deadline);

    const [hours, minutes] = assignment.endTime.split(":");

    deadlineDate.setHours(hours);
    deadlineDate.setMinutes(minutes);
    deadlineDate.setSeconds(0);

    if (Date.now() > deadlineDate.getTime()) {
      return res.status(400).json({
        msg: "Assignment deadline has passed",
      });
    }

    // Fetch classroom ONCE (important)
    const classroom = await Classroom.findById(assignment.classroom);
    if (!classroom)
      return res.status(404).json({ msg: "Classroom not found" });

    /* ================= TEXT EXTRACTION ================= */

    const extractedText = fileUrl
      ? await extractTextFromFile(fileUrl, fileType)
      : "";

    console.log("ExtractedText TYPE:", typeof extractedText);
    console.log("Extracted Text Length:", extractedText.length);

    /* ================= CHECK EXISTING SUBMISSION ================= */

    const existing = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id,
    });

    /* ================= PLAGIARISM CHECK ================= */

    const previousSubmissions = await Submission.find({
      assignment: assignmentId,
      student: { $ne: req.user._id },
    }).populate("student");

    let highestScore = 0;
    let matchedWith = [];

    for (const sub of previousSubmissions) {
      if (!sub.extractedText || !extractedText) continue;

      const score = tfidfSimilarity(extractedText, sub.extractedText);

      if (score >= 30) {
        matchedWith.push({
          student: sub.student._id,
          similarity: score,
        });

        highestScore = Math.max(highestScore, score);
      }
    }

    /* ============================================================
       ===================== RESUBMISSION =========================
       ============================================================ */

    if (existing) {
      if (existing.marks !== undefined && existing.marks !== null) {
        return res.status(400).json({
          msg: "Assignment already graded. Cannot resubmit.",
        });
      }

      existing.file = fileUrl;
      existing.extractedText = extractedText;
      existing.resubmitted = true;
      existing.submittedAt = new Date();
      existing.isLate =
        new Date(existing.submittedAt) > new Date(assignment.deadline);

      existing.plagiarism = {
        score: highestScore,
        matchedWith,
        flagged: highestScore > 40,
      };

      await existing.save();

      /* ---------- NEW SUBMISSION NOTIFICATION ---------- */

      if (classroom.teacher) {
        await createNotification({
          title: "New Submission",
          message: `${req.user.name} resubmitted "${assignment.title}" in ${classroom.name}.`,
          users: [classroom.teacher],
          role: "teacher",
          createdBy: req.user._id,
          type: "new_submission",
          link: `/assignment/submission/${assignment._id}`,
        });
      }

      /* ---------- PLAGIARISM ALERT (ONLY ONCE) ---------- */

      if (existing.plagiarism.flagged && classroom.teacher) {
        const alreadyNotified = await Notification.findOne({
          type: "plagiarism_alert",
          createdBy: req.user._id,
          link: `/assignment/submission/${assignment._id}`,
          "recipients.user": classroom.teacher,
        });

        if (!alreadyNotified) {
          await createNotification({
            title: "Plagiarism Detected ⚠️",
            message: `${req.user.name}'s resubmission shows ${existing.plagiarism.score}% similarity in "${assignment.title}".`,
            users: [classroom.teacher],
            role: "teacher",
            createdBy: req.user._id,
            type: "plagiarism_alert",
            link: `/assignment/submission/${assignment._id}`,
          });
        }
      }

      return res.json(existing);
    }

    /* ============================================================
       ===================== FIRST SUBMISSION =====================
       ============================================================ */

    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      file: fileUrl,
      extractedText,
      submittedAt: new Date(),
      isLate:
        assignment.deadline &&
        Date.now() > new Date(assignment.deadline).getTime(),
      plagiarism: {
        score: highestScore,
        matchedWith,
        flagged: highestScore > 40,
      },
    });


    /* ================= UPDATE PREVIOUS SUBMISSIONS ================= */

    for (const sub of previousSubmissions) {
      if (!sub.extractedText || !extractedText) continue;

      const score = tfidfSimilarity(extractedText, sub.extractedText);

      if (score >= 30) {

        // Update previous student's plagiarism data
        sub.plagiarism.score = Math.max(sub.plagiarism?.score || 0, score);

        const alreadyExists = sub.plagiarism?.matchedWith?.some(
          (m) => m.student.toString() === req.user._id.toString()
        );

        if (!alreadyExists) {
          sub.plagiarism.matchedWith.push({
            student: req.user._id,
            similarity: score,
          });
        }

        sub.plagiarism.flagged = sub.plagiarism.score > 40;

        await sub.save();
      }
    }

    /* ---------- NEW SUBMISSION NOTIFICATION ---------- */

    if (classroom.teacher) {
      await createNotification({
        title: "New Submission",
        message: `${req.user.name} submitted "${assignment.title}" in ${classroom.name}.`,
        users: [classroom.teacher],
        role: "teacher",
        createdBy: req.user._id,
        type: "new_submission",
        link: `/assignment/submission/${assignment._id}`,
      });
    }

    /* ---------- PLAGIARISM ALERT (ONLY ONCE) ---------- */

    if (submission.plagiarism.flagged && classroom.teacher) {
      const alreadyNotified = await Notification.findOne({
        type: "plagiarism_alert",
        createdBy: req.user._id,
        link: `/assignment/submission/${assignment._id}`,
        "recipients.user": classroom.teacher,
      });

      if (!alreadyNotified) {
        await createNotification({
          title: "Plagiarism Detected ⚠️",
          message: `${req.user.name}'s submission shows ${submission.plagiarism.score}% similarity in "${assignment.title}".`,
          users: [classroom.teacher],
          role: "teacher",
          createdBy: req.user._id,
          type: "plagiarism_alert",
          link: `/assignment/submission/${assignment._id}`,
        });
      }
    }

    console.log({
      fileUrl,
      extractedTextPreview: extractedText.substring(0, 100),
    });

    res.status(201).json(submission);
  } catch (err) {
    console.error("Submit Assignment Error:", err.message);
    res.status(500).json({
      msg: "Server Error",
      error: err.message,
    });
  }
};

// Teacher grades a submission
exports.gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { grade, feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ msg: "Invalid Submission ID" });

    if (req.user.role !== "teacher")
      return res.status(403).json({ msg: "Only teachers can grade submissions" });

    const submission = await Submission.findById(id).populate("assignment");

    if (!submission)
      return res.status(404).json({ msg: "Submission not found" });

    const classroom = await Classroom.findById(submission.assignment.classroom);

    if (!classroom)
      return res.status(404).json({ msg: "Classroom not found" });

    if (classroom.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ msg: "You are not the teacher of this class" });

    if (submission.plagiarism?.flagged) {
      return res.status(400).json({
        msg: "Plagiarism detected. Resolve before grading.",
      });
    }

    submission.marks = grade;
    submission.feedback = feedback;
    submission.resubmitted = false;
    await submission.save();

    await createNotification({
      title: "Assignment Graded",
      message: `Your assignment has been graded in "${classroom.name}".`,
      users: [submission.student],
      role: "student",
      createdBy: req.user._id,
      type: "assignment",
      link: `/assignment/submission/${submission.assignment._id}`,
    });

    res.json(submission);
  } catch (err) {
    console.error("Grade Submission Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// Get student's submission
exports.getMySubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assignmentId))
      return res.status(400).json({ msg: "Invalid Assignment ID" });

    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id,
    });

    res.json(submission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// Teacher: get all submissions for an assignment
exports.getAllSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assignmentId))
      return res.status(400).json({ msg: "Invalid Assignment ID" });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment)
      return res.status(404).json({ msg: "Assignment not found" });

    const classroom = await Classroom.findById(assignment.classroom);
    if (!classroom)
      return res.status(404).json({ msg: "Classroom not found" });

    if (classroom.teacher.toString() !== req.user._id.toString())
      return res.status(403).json({ msg: "You are not the teacher of this class" });

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate("student", "name email")
      .populate("plagiarism.matchedWith.student", "name email")
      .select("student plagiarism marks submittedAt file isLate");

    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
