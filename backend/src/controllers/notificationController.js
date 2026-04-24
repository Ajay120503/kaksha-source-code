const Notification = require("../models/Notification");

/**
 * Get Logged-in User Notifications
 */
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      "recipients.user": userId,
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name role");

    res.json({
      success: true,
      notifications,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Mark Notification as Read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const result = await Notification.updateOne(
      {
        _id: id,
        "recipients.user": userId,
      },
      {
        $set: { "recipients.$.read": true },
      }
    );

    // if notification not found OR user not recipient
    if (!result.matchedCount) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Marked as read",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete Notification (optional)
 */
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      "recipients.user": req.user._id,
    });

    if (!notification)
      return res.status(403).json({ message: "Not allowed" });

    await notification.deleteOne();

    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  const userId = req.user._id;

  const count = await Notification.countDocuments({
    recipients: {
      $elemMatch: { user: userId, read: false },
    },
  });

  res.json({ unread: count });
};