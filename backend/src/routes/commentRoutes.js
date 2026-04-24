const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { addComment, getComments, deleteComment } = require("../controllers/commentController");

// Add Comment or Reply
router.post("/add", auth, addComment);

// Get Comments of a Post
router.get("/:postId", auth, getComments);

// Delete Comment
router.delete("/:id", auth, deleteComment);

module.exports = router;
