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
const customError = require("../utils/customError");
const { uploadUserImage } = require("../services/uploadService");

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
        referrer.wallet += 100;
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
      message: result.message,
      success: true,
      data: { result },
    });
  } catch (error) {
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
  let userId = req.user.userId;

  const { fullName, phone, address } = req.body;

  try {
    if (fullName) {
      await User.findByIdAndUpdate(userId, { fullName }, { new: true });
    }

    if (phone || address) {
      await UserProfile.findOneAndUpdate(
        { user: userId },
        {
          ...(phone && { phone }),
          ...(address && { address }),
          // ...(profileImage && { profileImage }),
        },
        { new: true }
      );
    }

    res.status(200).json({ message: "User profile updated successfully" });
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
    res.status(StatusCodes.OK).json({ message: profile, data: profile });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const uploadProfileImage = async (req, res) => {
  let userId = req.user.userId;
  const { image } = req.files;

  if (!req?.files && !req?.files?.image) {
    return next(customError(400, "Please provide an image"));
  }

  const profileImage = await uploadUserImage(req.files.image.tempFilePath);

  const profile = await UserProfile.findOne({ user: req.user.userId });

  try {
    profile.profileImage = profileImage || profile.profileImage;
    await profile.save();

    res.status(200).json({ message: "Image uploaded", data: profile });
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
    res.status(StatusCodes.OK).json({ data: profile });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const get_country_account_details = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const profile = await findUserProfileById(userId);
  let userCountry = profile?.user?.country;

  let bank = [
    {
      name: "PROVIDENTIAL BANK",
      accountNo: "1234567890",
      country: "NGA",
    },
    {
      country: "RWA",
      name: "MOMO",
      accountNo: "1234567890",
    },
    {
      name: "PROVIDENTIAL BANK",
      accountNo: "1234567890",
      country: "BEN",
    },
  ];
  let userBank = bank.filter((b) => b.country === userCountry);
  res.status(StatusCodes.OK).json({ userBank });
});

// Route to create an admin user

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
  get_country_account_details,
};
