const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return v.trim().split(/\s+/).length <= 10;
        },
        message: "Title must not exceed 10 words",
      },
    },

    description: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return v.trim().split(/\s+/).length <= 30;
        },
        message: "Description must not exceed 30 words",
      },
    },

    deadline: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v.getTime() > Date.now();
        },
        message: "Deadline must be a future date",
      },
    },

    endTime: {
      type: String,
      required: true
    },

    maxMarks: {
      type: Number,
      default: 100,
      min: [1, "Max marks must be at least 1"],
      max: [100, "Max marks must not exceed 100"],
    },

    attachments: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: "Maximum 5 attachments allowed",
      },
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
