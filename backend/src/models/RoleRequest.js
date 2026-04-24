const mongoose = require("mongoose");

const roleRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    requestedRole: {
      type: String,
      enum: ["teacher"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("RoleRequest", roleRequestSchema);