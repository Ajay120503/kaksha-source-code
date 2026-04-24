// module.exports = (roles) => {
//   const allowedRoles = Array.isArray(roles) ? roles : [roles];

//   return (req, res, next) => {
//     try {
//       if (!req.user) {
//         return res.status(401).json({
//           message: "Unauthorized - Login required"
//         });
//       }

//       const userRole = req.user?.role;

//       if (userRole === "admin") return next();

//       if (!allowedRoles.includes(userRole)) {
//         return res.status(403).json({
//           message: "Access denied",
//           allowed: allowedRoles,
//           yourRole: userRole
//         });
//       }

//       next();
//     } catch (error) {
//       console.error("Role Middleware Error:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   };
// };


const User = require("../models/User");

module.exports = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized - Login required"
        });
      }

      /* ===== GET LATEST ROLE FROM DATABASE ===== */

      const user = await User.findById(req.user._id).select("role");

      if (!user) {
        return res.status(401).json({
          message: "User not found"
        });
      }

      const userRole = user.role;

      /* ===== ADMIN BYPASS ===== */

      if (userRole === "admin") {
        req.user.role = userRole;
        return next();
      }

      /* ===== ROLE CHECK ===== */

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: "Access denied",
          allowed: allowedRoles,
          yourRole: userRole
        });
      }

      /* ===== UPDATE REQUEST ROLE ===== */

      req.user.role = userRole;

      next();
    } catch (error) {
      console.error("Role Middleware Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
};