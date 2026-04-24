const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  createClass,
  joinClass,
  myClasses,
  getClassById,
  deleteClass,
  leaveClass,
  banStudent,
  unbanStudent,
} = require("../controllers/classroomController");

// ==========================
// Classroom Routes
// ==========================

// Create Classroom (Teacher only)
router.post("/create", auth, createClass);

// Join Classroom (Student)
router.post("/join", auth, joinClass);

// Leave Classroom (Student)
router.post("/leave/:id", auth, leaveClass);

router.post("/ban/:classId/:studentId", auth, banStudent);
router.post("/unban/:classId/:studentId", auth, unbanStudent);

// Get My Classrooms (Teacher + Student)
router.get("/my", auth, myClasses);

// Get Classroom By ID
router.get("/:id", auth, getClassById);

// Delete Classroom (Teacher only)
router.delete("/:id", auth, deleteClass);



module.exports = router;
