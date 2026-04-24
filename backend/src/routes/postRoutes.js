const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  createPost,
  getPosts,
  updatePost,
  deletePost,
} = require("../controllers/postController");

// Create Post for Classroom
router.post("/class/:classId", auth, createPost);

// Get Classroom Posts
router.get("/class/:classId", auth, getPosts);

router.put("/:postId", auth, updatePost);
router.delete("/:postId", auth, deletePost);

module.exports = router;
