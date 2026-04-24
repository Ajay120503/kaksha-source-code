const multer = require("multer");

const storage = multer.memoryStorage();

const allowedMimeTypes = {
  image: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  audio: ["audio/mpeg", "audio/mp3", "audio/wav"],
  pdf: ["application/pdf"],
  docs: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ],
  ppt: [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ]
};

const fileFilter = (req, file, cb) => {
  const allAllowed = [
    ...allowedMimeTypes.image,
    ...allowedMimeTypes.audio,
    ...allowedMimeTypes.pdf,
    ...allowedMimeTypes.docs,
    ...allowedMimeTypes.ppt,
  ];

  if (allAllowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"), false);
};

/**
 * Dynamic File Size Handling (REAL WORKING METHOD)
 * Multer doesn't support dynamic limit per file,
 * so we manually check buffer size in controller
 */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }
});

module.exports = {
  upload,
  allowedMimeTypes
};
