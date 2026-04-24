const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    title: { type: String, required: true },
    file: { type: String, required: true },
    public_id: { type: String, required: true },
    fileType: { type: String, default: "auto" },
    views: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
