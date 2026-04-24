const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  requestTeacherRole,
  getRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  getMyRoleRequest,
  deleteRoleRequest,
  getPendingRoleRequestCount
} = require("../controllers/roleRequestController");

/* STUDENT */
router.post("/request-teacher", auth, requestTeacherRole);

/* ADMIN */
router.get(
  "/",
  auth,
  roleMiddleware("admin"),
  getRoleRequests
);

router.patch(
  "/:id/approve",
  auth,
  roleMiddleware("admin"),
  approveRoleRequest
);

router.patch(
  "/:id/reject",
  auth,
  roleMiddleware("admin"),
  rejectRoleRequest
);

router.get(
  "/my-request",
  auth,
  getMyRoleRequest
);

router.delete(
  "/:id",
  auth,
  roleMiddleware("admin"),
  deleteRoleRequest
);

router.get(
  "/pending-count",
  auth,
  roleMiddleware("admin"),
  getPendingRoleRequestCount
);

module.exports = router;