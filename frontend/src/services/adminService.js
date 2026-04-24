import api from "./api";

const adminService = {
  /* ================= USERS ================= */

  getUsers: () => api.get("/admin/users"),
  changeRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  toggleBlock: (id) => api.patch(`/admin/users/${id}/block`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  /* ================= CLASSROOMS ================= */

  getClassrooms: () => api.get("/admin/classrooms"),
  deleteClassroom: (id) => api.delete(`/admin/classrooms/${id}`),

  /* ================= ROLE REQUESTS ================= */

  getRoleRequests: () => api.get("/role-requests"),
  approveRoleRequest: (id) => api.patch(`/role-requests/${id}/approve`),
  rejectRoleRequest: (id) => api.patch(`/role-requests/${id}/reject`),
  deleteRoleRequest: (id) => api.delete(`/role-requests/${id}`),

  getRoleRequestCount: () => api.get("/role-requests/pending-count"),
};

export default adminService;
