const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { upload } = require("../utils/upload");
const {
  uploadMaterial,
  getMaterials,
  updateMaterialTitle,
  deleteMaterial,
  incrementView,   
  togglePin,       
} = require("../controllers/materialController");

// Upload
router.post("/upload", auth, upload.single("file"), uploadMaterial);

// Get Classroom Materials
router.get("/:id", auth, getMaterials);

// Update Title
router.put("/update/:id", auth, updateMaterialTitle);

// Delete Material
router.delete("/delete/:id", auth, deleteMaterial);

// Increment views
router.patch("/view/:id", auth, incrementView);

// Pin / Unpin
router.patch("/pin/:id", auth, togglePin);


module.exports = router;
