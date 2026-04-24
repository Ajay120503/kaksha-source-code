require("dotenv").config();

const mongoose = require("mongoose");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

mongoose.connect(process.env.MONGO_URI);

async function fix() {
  const posts = await Post.find();

  for (const post of posts) {
    const count = await Comment.countDocuments({ post: post._id });

    await Post.findByIdAndUpdate(post._id, {
      commentsCount: count,
    });

    console.log(`Updated ${post._id} → ${count}`);
  }

  console.log("✅ Done");
  process.exit();
}

fix();
