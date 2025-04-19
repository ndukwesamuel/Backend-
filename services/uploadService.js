const cloudinary = require("../utils/Cloudinary");
// const uploadImages = require("../utils/uploadImages");

const uploadUserImage = async (tempFilePath) => {
  try {
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath, {
      use_filename: true,
      folder: "webuy",
    });
    return secure_url;
  } catch (error) {
    throw error;
  }
};

const uploadComboProductImage = async (tempFilePath) => {
  try {
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath, {
      use_filename: true,
      folder: "webuy/product/combo",
    });

    return secure_url;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadUserImage,
  uploadComboProductImage,
};
