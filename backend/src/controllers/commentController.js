const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Classroom = require("../models/Classroom");
const { createNotification } = require("../utils/notification");

// Add Comment
exports.addComment = async (req, res) => {
  try {
    const { postId, text, parentComment } = req.body;

    // ---- COMMENT TEXT VALIDATION ----
    if (!text || !text.trim()) {
      return res.status(400).json({
        msg: "Comment cannot be empty",
      });
    }

    // remove extra spaces
    const cleanText = text.trim();

    // length validation
    if (cleanText.length < 2) {
      return res.status(400).json({
        msg: "Comment must contain at least 2 characters",
      });
    }

    if (cleanText.length > 500) {
      return res.status(400).json({
        msg: "Comment cannot exceed 500 characters",
      });
    }

    // Validate postId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ msg: "Invalid Post ID" });
    }

    // Validate parentComment if provided
    if (parentComment && !mongoose.Types.ObjectId.isValid(parentComment)) {
      return res.status(400).json({ msg: "Invalid Parent Comment ID" });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      text: cleanText,
      parentComment: parentComment || null,
    });

    // ================= GET POST DETAILS =================
    const post = await Post.findById(postId)
      .populate("author")
      .populate("classroom");

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // increment + get updated value
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: 1 } },
      { new: true }
    );

    // ================= NOTIFICATIONS =================

const classroom = post.classroom;

// CASE 1: Reply to a comment
if (parentComment) {
  const parent = await Comment.findById(parentComment);

  if (parent && parent.author.toString() !== req.user._id.toString()) {
    await createNotification({
      title: "New Reply",
      message: `${req.user.name} replied to your comment.`,
      users: [parent.author],
      role: "student",
      createdBy: req.user._id,
      type: "comment",
      link: `/posts/${classroom._id}`,
    });
  }
}

// CASE 2: Student comments → notify teacher
else if (req.user.role === "student") {
  if (post.author._id.toString() !== req.user._id.toString()) {
    await createNotification({
      title: "New Comment",
      message: `${req.user.name} commented on your post.`,
      users: [post.author._id],
      role: "teacher",
      createdBy: req.user._id,
      type: "comment",
      link: `/posts/${classroom._id}`,
    });
  }
}

// CASE 3: Teacher comments → notify students
else if (req.user.role === "teacher") {
  if (classroom?.students?.length) {
    await createNotification({
      title: "Teacher Commented",
      message: `${req.user.name} added a comment in class discussion.`,
      users: classroom.students,
      role: "student",
      createdBy: req.user._id,
      type: "comment",
      link: `/posts/${classroom._id}`,
    });
  }
}

    res.status(201).json({ comment, commentsCount: updatedPost.commentsCount });
  } catch (err) {
    console.error("Add Comment Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// Get Comments of a Post
exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ msg: "Invalid Post ID" });
    }

    const comments = await Comment.find({ post: postId })
      .populate("author", "name email role")
      .populate("parentComment")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error("Get Comments Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// Delete Comment (Owner or Teacher Only)
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "Invalid Comment ID" });
    }

    const comment = await Comment.findById(id).populate("author");

    if (!comment) return res.status(404).json({ msg: "Comment not found" });

    // Allow delete if user wrote it or is a teacher
    if (
      comment.author._id.toString() !== req.user._id.toString() &&
      req.user.role !== "teacher"
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await Comment.findByIdAndDelete(id);

    const updatedPost = await Post.findByIdAndUpdate(
      comment.post,
      { $inc: { commentsCount: -1 } },
      { new: true }
    );
    // await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

    res.json({
      msg: "Comment deleted",
      commentsCount: updatedPost.commentsCount,
    });
  } catch (err) {
    console.error("Delete Comment Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
