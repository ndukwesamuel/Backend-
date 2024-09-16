const User = require("../../Models/Users");
const handleErrors = (err) => {
  let errs = {};

  // handling err from login
  if (err.message === "Incorrect password or email ") {
    return "Incorrect password or email";
  }
  if (err.message === "Incorrect password or email") {
    return "Incorrect password or email";
  }

  if (err.code === 11000 && err.keyPattern.name) {
    errs = "Name is not available";
  } else if (err.code === 11000 && err.keyPattern.email) {
    errs = "Email already exist";
    return errs;
  } else if (err.error === "ENOTFOUND") {
    errs = "Connection lost";
  }

  // validation errors
  if (
    err.message.includes("User validation failed") ||
    err.message.includes("category validation failed") ||
    err.message.includes("product validation failed")
  ) {
    Object.values(err.errors).forEach(({ properties }) => {
      // errs[properties.path] = properties.message;
      errs = properties.message;
    });
  }
  return errs;
};

const getImageId = (imageURL) => {
  const splitUrl = imageURL.split("/");
  const imageIdExt = splitUrl[splitUrl.length - 1];
  const imageId = imageIdExt.split(".")[0];
  return imageId;
};

const alphanumericChars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateReferralCode = async () => {
  let referralCode;
  let isUnique = false;

  while (!isUnique) {
    referralCode = "";
    for (let i = 0; i < 6; i++) {
      referralCode += alphanumericChars.charAt(
        Math.floor(Math.random() * alphanumericChars.length)
      );
    }

    const existingUser = await User.findOne({ referralCode });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return referralCode;
};

module.exports = { handleErrors, getImageId, generateReferralCode };
