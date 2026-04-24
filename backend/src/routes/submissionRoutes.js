const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  submitAssignment,
  gradeSubmission,
  getMySubmission,    
  getAllSubmissions  
} = require("../controllers/submissionController");

// Student submits an assignment
router.post("/submit", auth, submitAssignment);

// Student gets their submission for an assignment
router.get("/my/:assignmentId", auth, getMySubmission);

// Teacher grades a submission
router.put("/grade/:id", auth, gradeSubmission);

// Optional: Teacher gets all submissions for an assignment
router.get("/all/:assignmentId", auth, getAllSubmissions);

module.exports = router;
