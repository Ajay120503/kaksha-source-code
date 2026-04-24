const mongoose = require("mongoose");
const Post = require("../models/Post");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI

async function fixCounts() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("MongoDB Connected");

    const posts = await Post.find();

    for (const post of posts) {
      const realCount = post.comments ? post.comments.length : 0;

      await Post.updateOne(
        { _id: post._id },
        { $set: { commentsCount: realCount } }
      );

      console.log(`Updated ${post._id} → ${realCount}`);
    }

    console.log("🎉 All comment counts fixed");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixCounts();
