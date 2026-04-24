const Material = require("../models/Material");
const { cloudinary, detectResourceType } = require("../config/cloudinary");
const Classroom = require("../models/Classroom");
const { createNotification } = require("../utils/notification");

// UPLOAD MATERIAL
exports.uploadMaterial = async (req, res) => {
  try {
    const { classId, title } = req.body;

    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const mime = req.file.mimetype;
    const fileBuffer = req.file.buffer;
    const resourceType = detectResourceType(mime);

    // Upload to cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: resourceType,
            folder: "kaksha_materials",
          },
          (err, result) => {
            if (err) return reject(err);
            resolve(result);
          }
        )
        .end(fileBuffer);
    });

    const mat = await Material.create({
      classroom: classId,
      title,
      file: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      fileType: resourceType,
    });

    // ================= NOTIFICATIONS =================
    const classroom = await Classroom.findById(classId);

    if (classroom && classroom.students?.length) {
      await createNotification({
        title: "New Study Material",
        message: `${req.user.name} uploaded material in "${classroom.name}".`,
        users: classroom.students,
        role: "student",
        createdBy: req.user._id,
        type: "material",
        link:`/materials/${classroom._id}`
      });
    }

    res.status(200).json({
      message: "Material uploaded successfully",
      material: mat,
    });
  } catch (error) {
    console.error("Upload Material Error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

// GET CLASS MATERIALS
exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.find({
      classroom: req.params.id,
    })
      .populate("classroom", "name") 
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch", error: error.message });
  }
};


// UPDATE TITLE
exports.updateMaterialTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const mat = await Material.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    // ================= NOTIFICATIONS =================
    // if (mat) {
    //   const classroom = await Classroom.findById(mat.classroom);

    //   if (classroom?.students?.length) {
    //     await createNotification({
    //       title: "Material Updated",
    //       message: `Study material updated in "${classroom.name}".`,
    //       users: classroom.students,
    //       role: "student",
    //       createdBy: req.user._id,
    //       type: "material",
    //     });
    //   }
    // }

    res.json({ message: "Title updated", material: mat });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// DELETE MATERIAL
exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    const material = await Material.findById(id);
    if (!material) return res.status(404).json({ message: "Not found" });

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(material.public_id, {
      resource_type: material.fileType || "auto",
    });

    // ================= NOTIFICATIONS =================
    // const classroom = await Classroom.findById(material.classroom);

    // if (classroom?.students?.length) {
    //   await createNotification({
    //     title: "Material Removed",
    //     message: `A study material was removed from "${classroom.name}".`,
    //     users: classroom.students,
    //     role: "student",
    //     createdBy: req.user._id,
    //     type: "material",
    //   });
    // }

    await material.deleteOne();

    res.json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// INCREMENT VIEW COUNT
exports.incrementView = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!material)
      return res.status(404).json({ message: "Material not found" });

    res.json(material);
  } catch (error) {
    res.status(500).json({ message: "View update failed" });
  }
};

// TOGGLE PIN
exports.togglePin = async (req, res) => {
  try {
    if (req.user.role !== "teacher")
      return res.status(403).json({ message: "Only teacher can pin material" });

    const material = await Material.findById(req.params.id);
    if (!material)
      return res.status(404).json({ message: "Material not found" });

    material.isPinned = !material.isPinned;
    await material.save();

    // ================= NOTIFICATIONS =================
    const classroom = await Classroom.findById(material.classroom);

    if (classroom?.students?.length) {
      await createNotification({
        title: material.isPinned ? "Material Pinned" : "Material Unpinned",
        message: `${req.user.name} ${
          material.isPinned ? "pinned" : "unpinned"
        } a material in "${classroom.name}".`,
        users: classroom.students,
        role: "student",
        createdBy: req.user._id,
        type: "material",
        link:`/materials`
      });
    }

    res.json({
      message: material.isPinned ? "Material pinned" : "Material unpinned",
      material,
    });
  } catch (error) {
    res.status(500).json({ message: "Pin update failed" });
  }
};
