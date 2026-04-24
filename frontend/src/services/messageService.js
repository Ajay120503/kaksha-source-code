import api from "./api";

// GET all messages
export const getMessages = async (classId) => {
  const res = await api.get(`/messages/${classId}`);
  return res.data;
};

// EDIT message
export const editMessage = async (id, text) => {
  const res = await api.patch(`/messages/${id}`, { text });
  return res.data;
};

// DELETE message
export const deleteMessage = async (id) => {
  const res = await api.delete(`/messages/${id}`);
  return res.data;
};