const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const RefreshToken = require("../models/refreshTokenModel");

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, type: "refresh" }, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
};

const saveRefreshToken = async (userId, token) => {
  const decoded = jwt.decode(token);
  const expiresAt = new Date(decoded.exp * 1000);
  await RefreshToken.create(userId, token, expiresAt);
};

const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshSecret);

    const tokenRecord = await RefreshToken.findByToken(token);

    if (!tokenRecord) {
      throw new Error("Refresh token not found in database");
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      await RefreshToken.deleteByToken(token);
      throw new Error("Refresh token expired");
    }

    return decoded;
  } catch (error) {
    throw error;
  }
};

const revokeRefreshToken = async (token) => {
  return await RefreshToken.deleteByToken(token);
};

const revokeAllUserTokens = async (userId) => {
  return await RefreshToken.deleteAllByUserId(userId);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
