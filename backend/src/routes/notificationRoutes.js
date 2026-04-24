const express = require("express");
const router = express.Router();

const {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  getUnreadCount
} = require("../controllers/notificationController");

const auth = require("../middleware/authMiddleware");

// user must be logged in
router.get("/", auth, getMyNotifications);

router.patch("/:id/read", auth, markAsRead);

router.delete("/:id", auth, deleteNotification);

router.get("/unread/count", auth, getUnreadCount);

module.exports = router;