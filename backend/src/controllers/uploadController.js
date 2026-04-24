const { cloudinary, detectResourceType } = require("../config/cloudinary");
const { allowedMimeTypes } = require("../utils/upload");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const fileBuffer = req.file.buffer;
    const mime = req.file.mimetype;

    // ----- Dynamic Size Validation -----
    let maxSize = 25 * 1024 * 1024; // default

    if (allowedMimeTypes.image.includes(mime)) maxSize = 5 * 1024 * 1024;
    else if (allowedMimeTypes.audio.includes(mime)) maxSize = 15 * 1024 * 1024;

    if (fileBuffer.length > maxSize)
      return res.status(400).json({
        message: `File too large. Max allowed ${maxSize / (1024 * 1024)
          }MB`
      });

    const resourceType = detectResourceType(mime);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: resourceType,
            folder: "kaksha_materials"
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        )
        .end(fileBuffer);
    });

    res.status(200).json({
      message: "File uploaded successfully",
      fileUrl: uploadResult.secure_url,
      fileType: mime,
      resourceType
    });


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};
