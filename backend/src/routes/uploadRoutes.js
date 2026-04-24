const express = require("express");
const router = express.Router();
const { upload } = require("../utils/upload");
const { uploadFile } = require("../controllers/uploadController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Only teachers can upload materials
router.post(
  "/upload",
  auth,
  role(["teacher", "admin", "student"]),
  upload.single("file"),
  uploadFile
);

module.exports = router;
