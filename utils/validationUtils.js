const mongoose = require("mongoose");
const customError = require("./customError");
const OTP = require("../Models/otp");
// import OTP from "../Models/otp";

// import customError from "./customError";
// import customError from "./customError.js";

// Compares password
// async function validatePassword(incomingPassword, existingPassword) {
//   if (!incomingPassword || !existingPassword) {
//     throw customError(401, "Please provide password");
//   }
//   const isMatch = await bcrypt.compare(incomingPassword, existingPassword);
//   if (!isMatch) {
//     throw customError(401, "Unauthorized");
//   }
// }

// Validates OTP
async function validateOTP(email, otp) {
  const otpExists = await OTP.findOne({ email: "" });
  if (!otpExists) {
    throw customError(400, "Invalid or Expired OTP");
  }
  return otpExists;
}

// Checks if an id is a valid mongoose Id
function validateMongoId(id) {
  const isValid = mongoose.isValidObjectId(id);
  if (!isValid) {
    throw customError(400, `Invalid Id`);
  }
}

module.exports = {
  validateMongoId,
  // validatePassword,
  validateOTP,
};
