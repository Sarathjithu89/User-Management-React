require("dotenv").config();
module.exports = {
  secret: process.env.JWT_SECRET || "your-secret-key",
  expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
};
