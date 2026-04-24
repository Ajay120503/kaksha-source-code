const Notification = require("../models/Notification");

/**
 * Create Notification
 */

const createNotification = async ({
  title,
  message,
  users = [],
  role = null,
  createdBy,
  type = "general",
  link,
}) => {
  try {
    if (!users.length) return;

    const recipients = users.map((userId) => ({
      user: userId,
      role,
    }));

    await Notification.create({
      title,
      message,
      recipients,
      createdBy,
      type,
      link,
    });
  } catch (error) {
    console.error("Notification Error:", error.message);
  }
};

module.exports = {
  createNotification,
};