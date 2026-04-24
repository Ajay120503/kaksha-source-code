const Post = require("../models/Post");
const Classroom = require("../models/Classroom");
const { createNotification } = require("../utils/notification");

exports.createPost = async (req, res) => {
  try {
    const { text, attachments = [], isCode, language } = req.body;
    const { classId } = req.params;

    if (!classId || !text) {
      return res.status(400).json({ msg: "Class and text are required" });
    }

    const formattedAttachments = attachments
      .map((item) => {
        if (typeof item === "string" && item.includes("/")) {
          return {
            url: item,
            filename: item.split("/").pop().split("?")[0],
          };
        }

        if (typeof item === "object" && item?.url) {
          return {
            url: item.url,
            filename:
              item.filename ||
              item.url.split("/").pop().split("?")[0],
          };
        }

        return null;
      })
      .filter(Boolean);


    const post = await Post.create({
      classroom: classId,
      author: req.user.id,
      text,
      attachments: formattedAttachments,
      isCode: Boolean(isCode),
      language: isCode ? language : null,
    });

    // console.log("BODY RECEIVED:", req.body);
    // console.log("FORMATTED ATTACHMENTS:", formattedAttachments);

    // ================= NOTIFICATIONS =================
    const classroom = await Classroom.findById(classId);

    if (classroom) {

      // TEACHER POST → notify all students
      if (req.user.role === "teacher" && classroom.students?.length) {
        await createNotification({
          title: "New Announcement",
          message: `${req.user.name} posted in "${classroom.name}".`,
          users: classroom.students,
          role: "student",
          createdBy: req.user._id,
          type: "post",
          link:`/posts/${classroom._id}`
        });
      }
    }

    res.status(201).json(post);
  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({
      msg: "Server Error",
      error: err.message,
    });
  }
};


// Get Posts of a Classroom
exports.getPosts = async (req, res) => {
  try {
    const { classId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 6;

    const posts = await Post.find({ classroom: classId })
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Post.countDocuments({ classroom: classId });

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Get Posts Error:", err.message);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // Allow if teacher or post owner
    if (
      req.user.role !== "teacher" &&
      post.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ msg: "Not allowed" });
    }

    post.text = text || post.text;
    await post.save();

    // ================= NOTIFY CLASS =================
    // const classroom = await Classroom.findById(post.classroom);

    // if (classroom?.students?.length) {
    //   await createNotification({
    //     title: "Post Updated",
    //     message: `A class post has been updated in "${classroom.name}".`,
    //     users: classroom.students,
    //     role: "student",
    //     createdBy: req.user._id,
    //     type: "post",
    //   });
    // }

    res.json(post);
  } catch (err) {
    console.error("Update Post Error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (req.user.role !== "teacher")
      return res.status(403).json({ msg: "Only teachers can delete posts" });

    // ================= NOTIFY STUDENTS =================
    // const classroom = await Classroom.findById(post.classroom);

    // if (classroom?.students?.length) {
    //   await createNotification({
    //     title: "Post Removed",
    //     message: `A class post was removed from "${classroom.name}".`,
    //     users: classroom.students,
    //     role: "student",
    //     createdBy: req.user._id,
    //     type: "post",
    //   });
    // }

    await post.deleteOne();

    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete Post Error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

