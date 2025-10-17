const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const jwtConfig = require("../config/jwt");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all credentials",
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: userId,
        email,
        role: "user",
        name,
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: { id: userId, name, email, role: "user" },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and Password",
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.status != "active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive,Please contact admin",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );
    res.json({
      success: true,
      message: "Login successfull",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not Found",
      });
    }
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: "Logout successfull",
  });
};
