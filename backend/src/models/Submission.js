const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    file: {
      type: String,
      required: true,
    },

   extractedText: {
      type: String,
      default: "",
    },

    plagiarism: {
      score: { type: Number, default: 0 },
      flagged: { type: Boolean, default: false },
      matchedWith: [
        {
          student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          similarity: {
          type: Number,
          default: 0
        }
        }
      ],
    },

    marks: Number,
    feedback: String,

    resubmitted: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isLate: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);

submissionSchema.index({ assignment: 1, student: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
