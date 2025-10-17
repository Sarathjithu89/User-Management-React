const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 400;
    message = "Email already exists";
  }

  if (err.code === "ECONNREFUSED") {
    statusCode = 503;
    message = "Database connecion failed";
  }

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }
  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
