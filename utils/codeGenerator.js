const otpGenerator = require("otp-generator");
const User = require("../Models/Users");
const Order = require("../Models/Order");

const generateOTP = () => {
  const otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  return otp;
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

const generateOrderId = async () => {
  let orderId;
  let isUnique = false;

  while (!isUnique) {
    orderId = "";
    for (let i = 0; i < 6; i++) {
      orderId += alphanumericChars.charAt(
        Math.floor(Math.random() * alphanumericChars.length)
      );
    }

    const existingOrder = await Order.findOne({ orderId });
    if (!existingOrder) {
      isUnique = true;
    }
  }

  return orderId;
};
module.exports = { generateOTP, generateReferralCode, generateOrderId };
