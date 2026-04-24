const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  changeUserRole,
  toggleBlockUser,
  deleteUser,
  getAllClassrooms,
  deleteClassroom,
} = require("../controllers/adminController");

/* ================= USERS ================= */

// Admin only
router.get(
  "/users",
  auth,
  roleMiddleware("admin"),
  getAllUsers
);

router.patch(
  "/users/:id/role",
  auth,
  roleMiddleware("admin"),
  changeUserRole
);

router.patch(
  "/users/:id/block",
  auth,
  roleMiddleware("admin"),
  toggleBlockUser
);

router.delete(
  "/users/:id",
  auth,
  roleMiddleware("admin"),
  deleteUser
);

/* ================= CLASSROOMS ================= */

router.get(
  "/classrooms",
  auth,
  roleMiddleware("admin"),
  getAllClassrooms
);

router.delete(
  "/classrooms/:id",
  auth,
  roleMiddleware("admin"),
  deleteClassroom
);

module.exports = router;
