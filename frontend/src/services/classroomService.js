import api from "./api";

const createClassroom = async (data) => {
  const res = await api.post("/classroom/create", data);
  return res.data;
};

const joinClassroom = async (code) => {
  const res = await api.post("/classroom/join", { code });
  return res.data;
};

const myClassrooms = async () => {
  const res = await api.get("/classroom/my");
  return res.data;
};

const getClassroomById = async (classId) => {
  const res = await api.get(`/classroom/${classId}`);
  return res.data;
};

/* ================= NEW ================= */

/** 👨‍🏫 Teacher: Delete classroom */
const deleteClassroom = async (classId) => {
  const res = await api.delete(`/classroom/${classId}`);
  return res.data;
};

/** 👨‍🎓 Student: Leave classroom */
const leaveClassroom = async (classId) => {
  const res = await api.post(`/classroom/leave/${classId}`);
  return res.data;
};


/** 👨‍🏫 Teacher: Ban student */
const banStudent = async (classId, studentId) => {
  const res = await api.post(`/classroom/ban/${classId}/${studentId}`);
  return res.data;
};

/** 👨‍🏫 Teacher: Unban student */
const unbanStudent = async (classId, studentId) => {
  const res = await api.post(`/classroom/unban/${classId}/${studentId}`);
  return res.data;
};
/* ======================================= */

const classroomService = {
  createClassroom,
  joinClassroom,
  myClassrooms,
  getClassroomById,
  deleteClassroom,
  leaveClassroom,
  banStudent,
  unbanStudent,
};

export default classroomService;
