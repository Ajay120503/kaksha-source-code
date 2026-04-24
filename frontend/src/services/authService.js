import api from "./api";

const authService = {
  // REGISTER
  register: async (data) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  // LOGIN
  login: async (data) => {
    const res = await api.post("/auth/login", data);
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
    }
    return res.data;
  },

  // CURRENT USER
  me: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },

   // UPDATE PROFILE
  updateProfile: async (data) => {
    const res = await api.patch("/auth/update-profile", data);
    return res.data;
  },

  // UPDATE PASSWORD
  updatePassword: async (data) => {
    const res = await api.patch("/auth/update-password", data);
    return res.data;
  },

  // LOGOUT
  logout: () => {
    localStorage.removeItem("token");
  },
};

export default authService;
