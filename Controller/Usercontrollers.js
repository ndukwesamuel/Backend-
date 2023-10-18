const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const {
  handleErrors,
  getImageId,
} = require("../Middleware/errorHandler/function");
const { sendVerificationEmail } = require("../Middleware/Verification");
const User = require("../Models/Users");
const cloudinary = require("../utils/Cloudinary");
const UserProfile = require("../Models/UserProfile");
const { BadRequestError } = require("../errors");

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
    name: req.body.name,
    email: req.body.email,
  });

  savedUserprofile = await newProfile.save();

  sendVerificationEmail(savedUser, res);
};

const login = async (req, res) => {
  const { password, email } = req.body;

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
  try {
    const profile = await UserProfile.findOne({ user: req.user.id });
    if (profile.profileImage) {
      const imageId = getImageId(profile.profileImage);
      await cloudinary.uploader.destroy(`webuyam/profile/${imageId}`);
    }
    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "webuyam/profile",
    });
    data = {
      name: name,
      email: email,
      phone: phone,
      address: address,
      profileImage: upload.secure_url,
    };
    await UserProfile.findByIdAndUpdate(profile._id, data, {
      new: true,
    });

    res
      .status(StatusCodes.OK)
      .json({ message: "Profile successfully updated" });
  } catch (err) {
    // const errors = handleErrors(err);
    res.status(500).json({ error: err, message: "Profile update failed" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user.id });

    res.status(StatusCodes.OK).json(profile);
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
  login,
  logout,
};
