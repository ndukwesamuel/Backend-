const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { log } = require("console");
const {
  handleErrors,
  getImageId,
  generateReferralCode,
} = require("../Middleware/errorHandler/function");
const { createToken } = require("../Middleware/auth");
const { BrevosendVerificationEmail } = require("../Middleware/Verification");
const User = require("../Models/Users");
const cloudinary = require("../utils/Cloudinary");
const UserProfile = require("../Models/UserProfile");
const { BadRequestError } = require("../errors");
const asyncWrapper = require("../Middleware/asyncWrapper");
const {
  registerService,
  findUserByEmail,
  findUserProfileById,
  signIn,
} = require("../services/userService");
const { sendOTPByEmail } = require("../utils/emailUtils");
const { validateOTP } = require("../utils/validationUtils");

const register = asyncWrapper(async (req, res) => {
  let { name, email, password, country, referralCode } = req.body;
  let referrer;

  email = email.trim().toLowerCase();
  password = password.trim();

  if (!email || !password || !name || !country) {
    return res
      .status(400)
      .json({ error: "Please provide email, name, password, and country" });
  }

  try {
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (referralCode) {
      referrer = await User.findOne({ referralCode });
      if (referrer) {
        referrer.wallet += 1000;
        await referrer.save(); // Save the updated referrer's wallet balance
      } else {
        return res.status(200).json({ message: "Invalid referral code" });
      }
    }

    const refCode = await generateReferralCode();
    const newUser = new User({
      fullName: name,
      email: email,
      password: password,
      country: country,
      referralCode: refCode,
      referredBy: referrer ? referrer._id : null,
    });

    const savedUser = await newUser.save();

    if (referralCode && referrer) {
      referrer.referredUsers.push(savedUser._id);
      await referrer.save();
    }

    const newProfile = new UserProfile({
      user: savedUser._id,
      name: name,
      email: email,
      country: country,
    });

    const savedUserProfile = await newProfile.save();

    const result = await BrevosendVerificationEmail(savedUser, res);
    res.status(201).json({
      message: "Account created successfully",
      success: true,
      data: { result },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "An error occurred during registration" });
  }
});

const V1_register = asyncWrapper(async (req, res) => {
  const { user } = await registerService(req.body);
  const emailInfo = await sendOTPByEmail(user.email, user.fullName);

  // const result = await BrevosendVerificationEmail(savedUser, res);
  res.status(201).json({
    success: true,
    message: `OTP has been sent to ${emailInfo.envelope.to}`,
  });
});

const V1_sendOTP = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;
  const user = await findUserByEmail(email);
  const userProfile = await findUserProfileById(user._id);
  if (userProfile.isVerified) {
    return res.status(200).json({ message: "User Already Verified" });
  }
  const emailInfo = await sendOTPByEmail(email, user.fullName);
  res.status(201).json({
    message: `OTP has been sent to ${emailInfo.envelope.to}`,
  });
});

const V1_verifyOTP = asyncWrapper(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await findUserByEmail(email);
  const validator_info = await validateOTP(email, otp);
  user.verified = true;
  await user.save();
  res.status(200).json({ message: "Profile Verified" });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await signIn(email, password);
  res.status(200).json({ data: user });
});

const updateUserProfile = async (req, res) => {
  const { name, email, phone, address } = req.body;
  email = email.trim().toLowerCase();
  const profile = await UserProfile.findOne({ user: req.user.userId });
  if (!profile) {
    res.status(401).json({ message: "You need to login" });
  }
  try {
    data = {
      name: name,
      email: email,
      phone: phone,
      address: address,
    };
    await User.findByIdAndUpdate(req.user.userId, { name: name, email: email });
    await UserProfile.findByIdAndUpdate(profile._id, data);
    res
      .status(StatusCodes.OK)
      .json({ message: "Profile successfully updated" });
  } catch (err) {
    // const errors = handleErrors(err);
    res.status(500).json({ error: err, message: "Profile update failed" });
  }
};
const getAllUser = async (req, res) => {
  const users = await User.find().populate("referredUsers", "fullName");
  try {
    if (!users) {
      return res
        .status(404)
        .json({ message: "No user has registered!", data: users });
    }
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({
      user: req.user.userId,
    }).populate({
      path: "user",
      select: ["-password", "-isAdmin"], // Exclude the 'password' and "isAdmin" field
    });
    if (!profile) {
      res.status(401).json({ message: "You need to login" });
    }
    res.status(StatusCodes.OK).json({ message: profile });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const uploadProfileImage = async (req, res) => {
  const profile = await UserProfile.findOne({ user: req.user.userId });

  try {
    if (profile.profileImage) {
      const imageId = getImageId(profile.profileImage);
      await cloudinary.uploader.destroy(`webuyam/profile/${imageId}`);
    }
    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "webuyam/profile",
    });
    const data = { profileImage: upload.secure_url };

    await UserProfile.findByIdAndUpdate(profile._id, data, {
      new: true,
    });

    res.status(200).json({ message: "Image uploaded" });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  jwt.sign(
    authHeader,
    "",
    {
      expiresIn: 1,
    },
    (logout, err) => {
      if (logout) {
        res.status(200).json({ message: "Logged out" });
      } else {
        res.status(401).json({ message: err });
      }
    }
  );
};

// SendOTP
const sendOTP = asyncWrapper(async (req, res, next) => {
  const { email } = req.body;
  const user = await findUserByEmail(email);
  // const userProfile = await userService.findUserProfileById(user._id);
  // if (userProfile.isVerified) {
  //   return res.status(200).json({ message: "User Already Verified" });
  // }
  // const emailInfo = await emailUtils.sendOTPByEmail(email, user.firstName);
  // res.status(201).json({
  //   message: `OTP has been sent to ${email}`,
  //   // message: `OTP has been sent to ${emailInfo.envelope.to}`,
  // });
});

const get_A_UserProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const profile = await UserProfile.findOne({
      user: userId,
    }).populate({
      path: "user",
      select: ["-password", "-isAdmin"], // Exclude the 'password' and "isAdmin" field
    });
    if (!profile) {
      res.status(401).json({ message: "You need to login" });
    }
    res.status(StatusCodes.OK).json({ message: profile });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

module.exports = {
  updateUserProfile,
  getUserProfile,
  getAllUser,
  uploadProfileImage,
  register,
  login,
  logout,
  V1_register,
  sendOTP,
  V1_sendOTP,
  V1_verifyOTP,
  get_A_UserProfile,
};
