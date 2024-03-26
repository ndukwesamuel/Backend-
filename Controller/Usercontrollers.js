const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { log } = require("console");
const {
  handleErrors,
  getImageId,
  generateReferralCode,
} = require("../Middleware/errorHandler/function");
const { createToken } = require("../Middleware/auth");
const { sendVerificationEmail } = require("../Middleware/Verification");
const User = require("../Models/Users");
const cloudinary = require("../utils/Cloudinary");
const UserProfile = require("../Models/UserProfile");
const { BadRequestError } = require("../errors");

const register = async (req, res) => {
  let { name, email, password, country, referralCode } = req.body;
  let referrer;
  console.log("first", email, password);

  email = email.trim().toLowerCase();
  password = password.trim();

  if (!email || !password || !name || !country) {
    throw new BadRequestError(
      "Please provide email, name, password, and country"
    );
  }

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new BadRequestError("Email already exists");
  }

  if (referralCode) {
    referrer = await User.findOne({ referralCode });
    if (referrer) {
      // Add 1000 to the referrer's wallet balance
      referrer.wallet += 1000;
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
  savedUser = await newUser.save();

  // Update referrer's referredUsers array after savedUser has been saved
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

  savedUserProfile = await newProfile.save();

  sendVerificationEmail(savedUser, res);
};

const login = async (req, res) => {
  let { password, email } = req.body;
  email = email.trim().toLowerCase();
  password = password.trim();
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  try {
    const user = await User.login(email, password);
    if (user.verified) {
      const token = createToken(user._id);
      const { password, ...others } = user._doc;
      res.status(200).json({ ...others, token });
    } else {
      res.status(401).json({ message: "Verify email to login" });
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({ error });
  }
};

const updateUserProfile = async (req, res) => {
  const { name, email, phone, address } = req.body;
  email = email.trim().toLowerCase();
  const profile = await UserProfile.findOne({ user: req.user.id });
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
    await User.findByIdAndUpdate(req.user.id, { name: name, email: email });
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
    const profile = await UserProfile.findOne({ user: req.user.id }).populate({
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
  const profile = await UserProfile.findOne({ user: req.user.id });

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

module.exports = {
  updateUserProfile,
  getUserProfile,
  getAllUser,
  uploadProfileImage,
  register,
  login,
  logout,
};
