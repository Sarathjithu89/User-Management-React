const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authenticate = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.use(authenticate);
router.use(checkRole("admin"));

router.get("/profile", adminController.getAdminProfile);
router.put("/profile", adminController.updateAdminProfile);

router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

router.get("/stats", adminController.getStats);

module.exports = router;
