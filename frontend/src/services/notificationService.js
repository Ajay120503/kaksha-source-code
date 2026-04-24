import axios from "./api";

// Get all notifications
export const getNotifications = async () => {
  const res = await axios.get("/notifications");
  return res.data.notifications;
};

// Mark single notification as read
export const markNotificationRead = async (id) => {
  const res = await axios.patch(`/notifications/${id}/read`);
  return res.data;
};

// Delete notification
export const deleteNotification = async (id) => {
  const res = await axios.delete(`/notifications/${id}`);
  return res.data;
};

// Get unread count (for bell badge)
export const getUnreadCount = async () => {
  const res = await axios.get("/notifications/unread/count");
  return res.data.unread;
};