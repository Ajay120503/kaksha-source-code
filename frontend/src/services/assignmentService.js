import api from "./api";

const assignmentService = {
  createAssignment: async (data) => {
    const res = await api.post(`/assignments/create`, data);
    return res.data;
  },

  // Get ALL assignments of a classroom
  getAssignmentsByClass: async (classId) => {
    const res = await api.get(`/assignments/${classId}`);
    return res.data;
  },

  // Get Single Assignment
  getAssignmentById: async (id) => {
    const res = await api.get(`/assignments/single/${id}`);
    return res.data;
  },

  updateAssignment: async (id, data) => {
    const res = await api.put(`/assignments/${id}`, data);
    return res.data;
  },

  deleteAssignment: async (id) => {
    const res = await api.delete(`/assignments/${id}`);
    return res.data;
  },
};

export default assignmentService;
