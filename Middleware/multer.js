const multer = require("multer");

const FILE_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const Storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const extension = FILE_TYPE[file.mimetype];
    const fileName =
      file.originalname + new Date().toISOString().replace(/:/g, "-");
    cb(null, `${fileName}.${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const isValid = FILE_TYPE[file.mimetype];

  error = new Error("invalid image type");
  if (isValid) {
    error = null;
    cb(error, true);
  } else {
    cb(error, false);
  }
};
const maxSize = 1 * 1024 * 1024;
const upload = multer({
  storage: Storage,
  fileFilter: fileFilter,
  limits: { fileSize: maxSize },
});

module.exports = upload;
