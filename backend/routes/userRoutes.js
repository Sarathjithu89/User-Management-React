const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authenticate = require("../middleware/auth");

router.use(authenticate);

router.get("/profile", userController.getProfile);
router.put("/profile", userController.updateProfile);

module.exports = router;
