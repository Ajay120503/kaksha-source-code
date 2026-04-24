const express = require("express");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const app = express();

// Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/classroom", require("./routes/classroomRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/submission", require("./routes/submissionRoutes"));
app.use("/api/materials", require("./routes/materialRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/role-requests", require("./routes/roleRequestRoutes"));
app.use("/api/join-requests", require("./routes/classJoinRequestRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.message);

  if (err instanceof multer.MulterError)
    return res.status(400).json({ message: err.message });

  if (err.message === "Invalid file type")
    return res
      .status(400)
      .json({ message: "Only Images, Audio, PDF, DOC, PPT allowed" });

  res.status(500).json({
    message: "Server Error",
    error: err.message
  });
});

module.exports = app;
