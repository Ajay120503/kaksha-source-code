import api from "./api";

const postService = {
  // Create post
  createPost: async (classId, data) => {
    const res = await api.post(`/posts/class/${classId}`, data);
    return res.data;
  },

  // Get posts of a class (pagination)
  getPostsByClass: async (classId, page = 1) => {
    const res = await api.get(`/posts/class/${classId}?page=${page}`);
    return res.data;
  },

  // Update post
  updatePost: async (postId, text) => {
    const res = await api.put(`/posts/${postId}`, text)
    return res.data;
  },

  // Delete post
  deletePost: async (postId) => {
    const res = await api.delete(`/posts/${postId}`);
    return res.data;
  },
};

export default postService;
