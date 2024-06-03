// const UserProfile = require("../models/userProfile");
// const User = require("../models/user");
// const customError = require("../utils/customError");
// const validateMongoId = require("../utils/validateMongoId");
// const KYC = require("../models/kyc");
// const Wallet = require("../models/wallet");
// const generateRandomUsername = require("../utils/generateUsername");
// const countryToCurrency = require("country-to-currency");
// const bcrypt = require("bcrypt");

// exports.registerUser = async (userData) => {
//   // console.log(countryToCurrency[userData.country]); // USD
//   console.log({
//     userData,
//   });

//   const salt = await bcrypt.genSalt(10);
//   const hashedNewPincode = await bcrypt.hash(userData.password, salt);
//   const user = await User.create({
//     email: userData.email,
//     password: hashedNewPincode,
//     firstName: userData.firstName,
//     lastName: userData.lastName,
//     country: userData.country,
//   });

//   let name = `${user.firstName} ${user.lastName}`;
//   let generatedUsername = generateRandomUsername(user.email, name);
//   const userProfile = await UserProfile.create({
//     userId: user._id,
//     username: generatedUsername,
//   });

//   const kyc = await KYC.create({
//     userId: user._id,
//   });

//   const wallet = await Wallet.create({
//     userId: user._id,
//     Currency: countryToCurrency[userData.country],
//   });

//   return { user, userProfile, kyc, wallet };
// };

// exports.updateUserProfile = async (userId, userDetails) => {
//   try {
//     // Updating userProfile model
//     const userProfile = await UserProfile.findOneAndUpdate(
//       { userId: userId },
//       userDetails
//     );
//     return { message: "Details Updated Successfully!", userProfile };
//   } catch (error) {
//     throw error;
//   }
// };

// exports.updateUserModel = async (userId, userInfo) => {
//   const userProfile = await UserProfile.findOne({ userId: userId });
//   try {
//     // Updating user model
//     await User.findOneAndUpdate({ _id: userProfile.userId }, userInfo);
//     return { message: "User Info Updated Successfully!" };
//   } catch (error) {
//     throw error;
//   }
// };

// // exports.validatePassword = async (userId, password) => {
// //   if (!password) {
// //     throw customError(401, "Please provide password");
// //   }

// //   const user = await User.findOne({ _id: userProfile.userId });
// //   const isPasswordCorrect = await user.comparePassword(password);

// //   if (!isPasswordCorrect) {
// //     throw customError(401, "Unauthorized");
// //   }
// // };

// exports.validatePincode = async (user_data, pinCode) => {
//   try {
//     if (!pinCode) {
//       throw customError(404, "PIN Code is required");
//     }

//     if (!/^\d{4}$/.test(pinCode)) {
//       throw customError(404, "PIN must be a 4-digit number.");
//     }

//     const userProfile____ = await UserProfile.findOne({
//       userId: user_data.userId._id,
//     });

//     // // Check if user profile exists
//     if (!userProfile____) {
//       throw customError(404, "User profile not found");
//     }

//     // Compare provided pin code with stored hashed pin code
//     const isPinCodeCorrect = await bcrypt.compare(
//       pinCode,
//       userProfile____.pinCode
//     );
//     if (!isPinCodeCorrect) {
//       throw customError(404, "PIN code is incorrect");
//     }

//     return isPinCodeCorrect;
//   } catch (error) {
//     return error.message;
//   }
// };

// exports.validatePassword = async (user_data, password) => {
//   try {
//     if (!password) {
//       throw customError(404, "password Code is required");
//     }
//     const userinfo = await User.findOne({
//       _id: user_data.userId._id,
//     });
//     const isPasswordCorrect = await userinfo.comparePassword(password);
//     if (!isPasswordCorrect) {
//       throw customError(404, "Your password is incorrect");
//     }
//     return isPasswordCorrect;
//   } catch (error) {
//     return error.message;
//   }
// };
