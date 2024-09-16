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
  const groupinfo = await Group.findById(groupId)
    .populate({
      path: "members",
      model: User, // Adjust the path as needed
    })
    .populate({
      path: "pendingMembers",
      model: User, // Adjust the path as needed
    });

  if (!groupinfo) {
    throw customError(404, "groupinfo");
  }

  return groupinfo;
}

async function findGroups_info(datainfo) {
  const groupinfo = await Group.find(datainfo)
    .populate({
      path: "members",
      model: User, // Adjust the path as needed
    })
    .populate({
      path: "pendingMembers",
      model: User, // Adjust the path as needed
    });

  return groupinfo;
}

const isUserInAnyGroup = async (userId) => {
  console.log({
    userId,
  });
  // Find groups where the user is a member
  const groups = await Group.find({ members: userId });
  if (groups.length > 0) {
    return groups;
  } else {
    return false;
  }
};

async function requesting_user_member_group_level(
  group_info,
  requestingUserId
) {
  // Check if the requesting user is an admin
  const isAdmin = group_info.admins.includes(requestingUserId);
  // Check if the user to add is already a member or pending member
  const isMember = group_info.members.includes(requestingUserId);

  return {
    isAdmin,
    isMember,
  };
}

module.exports = {
  findGroupById,
  isUserInAnyGroup,
  requesting_user_member_group_level,
  findGroups_info,
};
