const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");

router.post("/create", auth, createAssignment);
router.get("/:classId", auth, getAssignments);
router.put("/:id", auth, updateAssignment);
router.delete("/:id", auth, deleteAssignment);

router.get("/single/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ msg: "Invalid Assignment ID" });

    const assignment = await require("../models/Assignment").findById(id);
    if (!assignment) return res.status(404).json({ msg: "Assignment not found" });

    res.json(assignment);
  } catch (err) {
    console.error("Get Assignment Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

module.exports = router;
