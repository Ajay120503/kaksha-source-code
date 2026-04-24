import api from "./api";

const getToken = () =>
  JSON.parse(localStorage.getItem("user"))?.token;

const materialService = {
  uploadMaterial: async (formData) => {
    const res = await api.post("/materials/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return res.data;
  },

  getMaterials: async (classId) => {
    const res = await api.get(`/materials/${classId}`);
    return res.data;
  },

  deleteMaterial: async (id) => {
    return api.delete(`/materials/delete/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  },

  updateTitle: async (id, title) => {
    return api.put(
      `/materials/update/${id}`,
      { title },
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
  },

  incrementView: async (id) => {
    return api.patch(
      `/materials/view/${id}`,
      {},
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
  },

  togglePin: async (id) => {
    return api.patch(
      `/materials/pin/${id}`,
      {},
      { headers: { Authorization: `Bearer ${getToken()}` } }
    );
  },
};

export default materialService;
