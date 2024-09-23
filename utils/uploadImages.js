const cloudinary = require("../utils/Cloudinary");

const uploadImages = async (files) => {
  const uploadedUrls = [];

  // Upload each file to Cloudinary
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        file.tempFilePath,
        {
          use_filename: true,
          folder: "zynopay",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            uploadedUrls.push(result.secure_url);
            resolve();
          }
        }
      );
    });
  });

  await Promise.all(uploadPromises);
  return uploadedUrls;
};

module.exports = uploadImages;
