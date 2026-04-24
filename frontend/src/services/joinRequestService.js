import api from "./api";

export default {
  getRequests: () => api.get("/join-requests"),
  getPendingCount: () => api.get("/join-requests/pending-count"),
  approve: (id) => api.patch(`/join-requests/approve/${id}`),
  reject: (id) => api.patch(`/join-requests/reject/${id}`),
  delete: (id) => api.delete(`/join-requests/${id}`),
};