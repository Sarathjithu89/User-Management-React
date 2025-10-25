const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const uploadDir = "uploads/profile-pictures/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and GIF files are allowed"));
    }
  },
});

const cropImage = async (req, res, next) => {
  if (!req.file) return next();

  const filePath = path.join(uploadDir, req.file.filename);
  const croppedPath = path.join(uploadDir, `cropped-${req.file.filename}`);

  try {
    await sharp(filePath)
      .resize(300, 300, { fit: "cover" })
      .toFile(croppedPath);

    fs.unlinkSync(filePath);

    req.file.filename = `cropped-${req.file.filename}`;
    req.file.path = croppedPath;

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, cropImage };
