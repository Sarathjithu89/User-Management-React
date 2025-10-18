const User = require("../models/userModel");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;
    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role, Must be a admin/user",
      });
    }
    if (userId == req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Caonnot change your own role",
      });
    }
    const updated = await User.updateRole(userId, role);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = await User.findById(userId);

    res.json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAdminProfile = async (req, res, next) => {
  try {
    const { name, email, phone, address, department } = req.body;
    const adminId = req.user.id;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (email !== req.user.email) {
      const User = require("../models/userModel");
      const emailExists = await User.emailExists(email, adminId);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    const User = require("../models/userModel");
    const updated = await User.update(adminId, {
      name,
      email,
      phone,
      address,
      department,
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "Failed to update profile",
      });
    }

    const updatedUser = await User.findById(adminId);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminProfile = async (req, res, next) => {
  try {
    const User = require("../models/userModel");
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
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
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (userId == req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }
    const deleted = await User.delete(userId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "User not Found",
      });
    }
    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const stats = await User.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
