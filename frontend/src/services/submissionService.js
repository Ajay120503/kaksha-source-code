import api from "./api";

const submissionService = {
  submit: async (data) => {
    const res = await api.post("/submission/submit", data);
    return res.data;
  },

  getMySubmission: async (assignmentId) => {
    const res = await api.get(`/submission/my/${assignmentId}`);
    return res.data;
  },

  getAllSubmissions: async (assignmentId) => {
    const res = await api.get(`/submission/all/${assignmentId}`);
    return res.data;
  },

  gradeSubmission: async (id, data) => {
    const res = await api.put(`/submission/grade/${id}`, data);
    return res.data;
  },
};

export default submissionService;
