const https = require("https");
const { StatusCodes } = require("http-status-codes");

const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  handleErrors,
  getImageId,
} = require("../Middleware/errorHandler/function");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../Middleware/Verification");
const { createToken, verifyToken } = require("../Middleware/auth");
const User = require("../Models/Users");
const Group = require("../Models/Group");
const Email = require("../Models/emailVerification");
const userPasswordReset = require("../Models/passwordReset");
const Category = require("../Models/Category");
const Product = require("../Models/Products");
const Cart = require("../Models/Cart");
const paymentVerification = require("../Models/paymentVerification");
const cloudinary = require("../utils/Cloudinary");
const UserProfile = require("../Models/UserProfile");
const { BadRequestError } = require("../errors");
const upload = require("../Middleware/multer").single("image");

dotenv.config();

const paystackKey = process.env.PAYSTACK_SECRET_KEY;

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    throw new BadRequestError("Please provide email, name and password");
  }

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new BadRequestError("Email already exists");
  }

  const newUser = new User({
    fullName: name,
    email: email,
    password: password,
  });

  savedUser = await newUser.save();

  const newProfile = new UserProfile({
    user: savedUser._id, // Reference to the user document
    firstName: req.body.name,
  });

  savedUserprofile = await newProfile.save();

  sendVerificationEmail(savedUser, res);
};

const updateUserProfile = async (req, res) => {
  console.log(req);
  res.status(StatusCodes.OK).json({ name: "this " });
};

const getUserProfile = async (req, res) => {
  console.log("req");
  try {
    const profiles = await UserProfile.find().populate("user"); // Populate the 'user' field with user details

    res.status(StatusCodes.OK).json(profiles);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
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
  register,
  logout,
};
