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
const groupmodel = require("../Models/Group");

const { BadRequestError } = require("../errors");
const upload = require("../Middleware/multer").single("image");

dotenv.config();

const paystackKey = process.env.PAYSTACK_SECRET_KEY;

const createGroup = async (req, res) => {
  console.log({ name: req.user });
  const { name, description } = req.body;
  const creator = req.user.id;

  if (!name || !description) {
    throw new BadRequestError("Please provide email and password");
  }

  const isAdminOfAnyGroup = await groupmodel.exists({
    $or: [
      { creator: creator }, // User is the creator of a group
      { admins: creator }, // User is listed in the admins of a group
    ],
  });

  if (isAdminOfAnyGroup) {
    throw new BadRequestError("You cannot create a group as an admin");
  }

  let newdata = { name, description, creator, admins: [creator] };

  const group = await groupmodel.create(newdata);

  res.status(StatusCodes.OK).json(group);
};

module.exports = {
  createGroup,
};
