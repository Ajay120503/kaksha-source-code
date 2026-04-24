const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  getMessages,
  deleteMessage,
  editMessage,
} = require("../controllers/messageController");

router.get("/:classId", auth, getMessages);
router.patch("/:id", auth, editMessage);
router.delete("/:id", auth, deleteMessage);

module.exports = router;