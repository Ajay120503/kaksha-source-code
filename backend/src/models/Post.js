const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },

    attachments: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
      },
    ],


    isCode: {
      type: Boolean,
      default: false,
    },

    language: {
      type: String,
      enum: [
        "plaintext",
        "javascript",
        "typescript",
        "python",
        "java",
        "c",
        "cpp",
        "php",
        "html",
        "css",
        "sql",
        "bash",
      ],
      default: null,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);

