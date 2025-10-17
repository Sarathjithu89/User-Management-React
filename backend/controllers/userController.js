const User = require("../models/userModel");

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
      const eamilExists = await User.eamilExists(email, userId);
      if (eamilExists) {
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
        message: "Failded to update profile",
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
