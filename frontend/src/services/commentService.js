import api from "./api";

const commentService = {
  addComment: async (data) => {
    const res = await api.post("/comments/add", data);
    return res.data;
  },

  getComments: async (postId) => {
    const res = await api.get(`/comments/${postId}`);
    return res.data;
  },

  deleteComment: async (id) => {
    const res = await api.delete(`/comments/${id}`);
    return res.data;
  },
};

export default commentService;
