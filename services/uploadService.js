const cloudinary = require("../utils/Cloudinary");
const uploadImages = require("../utils/uploadImages");

const uploadUserImage = async (tempFilePath) => {
  try {
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath, {
      use_filename: true,
      folder: "zynopay",
    });
    return secure_url;
  } catch (error) {
    throw error;
  }
};

const uploadUserPhotos = async (photoFiles) => {
  try {
    const uploadedUrls = await uploadImages(photoFiles);
    return uploadedUrls;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  uploadUserImage,
  uploadUserPhotos,
};
