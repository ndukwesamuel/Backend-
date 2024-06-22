// import UserProfile from "../models/userProfile.js";
// import User from "../models/user.js";
// import { validatePassword } from "../utils/validationUtils.js";
// import customError from "../utils/customError.js";
// import generateToken from "../config/generateToken.js";
const mongoose = require("mongoose");
const UserProfile = require("../Models/UserProfile");
const User = require("../Models/Users");
const customError = require("../utils/customError");
const { generateReferralCode } = require("../Middleware/errorHandler/function");
const { validatePassword } = require("../utils/validationUtils");
const generateToken = require("../db/generateToken");
// import { paginate } from "../utils/paginate.js";
const Group = require("../Models/Group");

// Fields to exclude
const excludedFields = ["-password", "-__v", "-createdAt", "-updatedAt"];

// Register User

async function findGroupById(groupId) {
  const groupinfo = await Group.findById(groupId);
  if (!groupinfo) {
    throw customError(404, "groupinfo");
  }

  return groupinfo;
}

const isUserInAnyGroup = async (userId) => {
  // Find groups where the user is a member
  const groups = await Group.find({ members: userId }).exec();
  if (groups.length > 0) {
    return groups;
  } else {
    return false;
  }
};

// async function findUserProfileById(userId) {
//   const userProfile = await UserProfile.findOne({ user: userId }).populate({
//     path: "user",
//     select: excludedFields,
//   });

//   if (!userProfile) {
//     throw customError(404, "User profile not found");
//   }
//   return userProfile;
// }

// async function signIn(email, password) {
//   const user = await findUserByEmail(email);
//   await validatePassword(password, user.password);
//   const userProfile = await findUserProfileById(user._id);
//   if (!user.verified) {
//     throw customError(401, "Email not verified!");
//   }

//   //generate new token
//   const token = generateToken(user._id);

//   const userInfo = {
//     token,
//     user,
//   };

//   return userInfo;
// }

module.exports = {
  findGroupById,
  isUserInAnyGroup,
};
