const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticate = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(authenticate);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);

router.post(
  "/profile-picture",
  upload.single("profilePicture"),
  userController.uploadProfilePicture
);
router.get("/profile-picture/:userId", userController.getProfilePicture);
router.delete("/profile-picture", userController.deleteProfilePicture);

module.exports = router;
