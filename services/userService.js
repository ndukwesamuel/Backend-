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

// Fields to exclude
const excludedFields = ["-password", "-__v", "-createdAt", "-updatedAt"];

// Register User
async function registerService(userData) {
  let { name, email, password, country, referralCode } = userData;
  let referrer = null; // Declare referrer variable

  // Starts Session
  const session = await mongoose.startSession();
  session.startTransaction();
  const requiredFields = ["name", "email", "country", "password"];
  const missingField = requiredFields.find((field) => !userData[field]);
  if (missingField) {
    await session.abortTransaction();
    session.endSession();
    throw customError(400, `${missingField} is required!`);
  }

  try {
    if (referralCode) {
      referrer = await User.findOne({ referralCode });
      if (referrer) {
        referrer.wallet += 100;
        await referrer.save(); // Save the updated referrer's wallet balance
      } else {
        throw customError(400, `Invalid referral code`);
      }
    }

    const refCode = await generateReferralCode();

    const user = await User.create(
      [
        {
          fullName: name,
          email: email,
          password: password,
          country: country,
          referralCode: refCode,
          referredBy: referrer ? referrer._id : null,
        },
      ],
      { session }
    );
    const userProfile = await UserProfile.create(
      [
        {
          user: user[0]._id,
        },
      ],
      { session }
    );

    if (referralCode && referrer) {
      referrer.referredUsers.push(user[0]._id);
      await referrer.save();
    }
    // Commit changes to DB
    await session.commitTransaction();
    session.endSession();
    return { user: user[0], userProfile: userProfile[0] };
  } catch (error) {
    // Reverses anything that has been done
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

async function findUserByEmail(email) {
  if (!email) {
    throw customError(400, "Please provide an email");
  }
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw customError(401, "Unauthorised");
  }

  return user;
}

async function findUserProfileById(userId) {
  const userProfile = await UserProfile.findOne({ user: userId }).populate({
    path: "user",
    select: excludedFields,
  });

  if (!userProfile) {
    throw customError(404, "User profile not found");
  }
  return userProfile;
}

async function signIn(email, password) {
  const user = await findUserByEmail(email);

  await validatePassword(password, user.password);
  const userProfile = await findUserProfileById(user._id);

  console.log({
    dsd: user,
    userProfile,
    email,
    password,
  });
  if (!user.verified) {
    throw customError(401, "Email not verified!");
  }

  //generate new token
  const token = generateToken(user._id);

  const userInfo = {
    token,
    user,
  };

  return userInfo;
}

module.exports = {
  registerService,
  findUserByEmail,
  findUserProfileById,
  signIn,
};
