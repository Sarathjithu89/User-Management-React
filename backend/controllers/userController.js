const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    const userId = req.user.id;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }
    if (email !== req.user.email) {
      const emailExists = await User.emailExists(email, userId);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    const updated = await User.update(userId, { name, email, phone, address });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "Failed to update profile",
      });
    }

    const updatedUser = await User.findById(userId);
    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const userId = req.user.id;
    const User = require("../models/userModel");

    const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedMimes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Only JPEG, PNG, and GIF files are allowed",
      });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "File size must be less than 5MB",
      });
    }

    const oldPicturePath = await User.getProfilePicturePath(userId);
    if (oldPicturePath && fs.existsSync(oldPicturePath)) {
      fs.unlinkSync(oldPicturePath);
    }

    const relativePath = `uploads/profile-pictures/${req.file.filename}`;
    await User.updateProfilePicturePath(userId, relativePath);

    const user = await User.findById(userId);

    res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: user,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

exports.getProfilePicture = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const User = require("../models/userModel");

    const picturePath = await User.getProfilePicturePath(userId);

    if (!picturePath || !fs.existsSync(picturePath)) {
      return res.status(404).json({
        success: false,
        message: "Profile picture not found",
      });
    }

    res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(path.resolve(picturePath));
  } catch (error) {
    next(error);
  }
};

exports.deleteProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const User = require("../models/userModel");

    const picturePath = await User.getProfilePicturePath(userId);

    if (picturePath && fs.existsSync(picturePath)) {
      fs.unlinkSync(picturePath);
    }

    await User.updateProfilePicturePath(userId, null);

    res.json({
      success: true,
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
