const cloudinary = require("../utils/Cloudinary");
// const uploadImages = require("../utils/uploadImages");

const uploadUserImage = async (tempFilePath) => {
  try {
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath, {
      use_filename: true,
      folder: "webuyam",
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
      folder: "webuyam/product/combo",
    });

    return secure_url;
  } catch (error) {
    throw error;
  }
};
const extractPublicIdFromUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl || typeof cloudinaryUrl !== "string") {
    return null;
  }
  try {
    // Match pattern: /v{numbers}/{folder}/{filename}
    const regex = /\/v\d+\/([^/]+\/[^.]+)/;
    const match = cloudinaryUrl.match(regex);

    if (match && match[1]) {
      return match[1];
    }

    return null;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
};
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    return result;
  } catch (error) {
    console.error(`Error deleting image with public ID ${publicId}:`, error);
    throw error;
  }
};
module.exports = {
  uploadUserImage,
  uploadComboProductImage,
  extractPublicIdFromUrl,
  deleteImage,
};
