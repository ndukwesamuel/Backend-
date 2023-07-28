const handleErrors = (err) => {
  let errs = {};

  // handling err from login
  if (err.message === "Incorrect email") {
    return "Email not registered";
  }
  if (err.message === "Incorrect password") {
    return "Incorrect password";
  }

  if (err.code === 11000 && err.keyPattern.name) {
    // duplicate errors
    errs = "Name is not available";
  } else {
    errs = "Email already exist";
    return errs;
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

module.exports = { handleErrors, getImageId };
