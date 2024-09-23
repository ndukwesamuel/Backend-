const { Router } = require("express");
const mongoose = require("mongoose");
const upload = require("../Middleware/multer");
const router = Router();
const User = require("../Models/Users");
const UserProfile = require("../Models/UserProfile");
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  passwordResetEmail,
  resetPassword,
} = require("../Controller/passwordResestController");
const {
  getUserProfile,
  updateUserProfile,
  getAllUser,
  uploadProfileImage,
  register,
  login,
  logout,
  V1_register,
  get_A_UserProfile,
  get_country_account_details,
} = require("../Controller/Usercontrollers");
const {
  emailVerification,
  resendVerificationEmail,
} = require("../Controller/verificationController");

// const AdminRoute = Router();

// const Creat_admin = async (req, res) => {
//   // const { fullName, email, password, country } = req.body;

//   try {
//     const newUser = new User({
//       fullName: "Ndukwe",
//       email: "ndukwesamuel23@gmail.com",
//       password: "adminndukwesamuel23@gmail.com",
//       country: "NGR",
//       verified: true,
//       isAdmin: true, // Set isAdmin to true
//     });

//     // Save the user to the database
//     await newUser.save();
//     res
//       .status(201)
//       .json({ message: "Admin user created successfully", user: newUser });
//   } catch (error) {
//     console.log({
//       error: error,
//     });

//     res.status(500).json({ message: "Server error" });
//   }
// };

const Creat_admin = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create new user
    const newUser = new User({
      fullName: "Ndukwe",
      email: "ndukwesamuel23@gmail.com",
      password: "adminndukwesamuel23@gmail.com",
      country: "NGR",
      verified: true,
      isAdmin: true,
    });

    // Save the user to the database
    await newUser.save({ session });

    // Create new user profile
    const newUserProfile = new UserProfile({
      user: newUser._id,
    });

    // Save the user profile to the database
    await newUserProfile.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Admin user and profile created successfully",
      user: newUser,
      profile: newUserProfile,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating admin and profile:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

router.route("/").get(verifyTokenAndAdmin, getAllUser);
router.route("/create-admin").get(Creat_admin);

router
  .route("/profile")
  .patch(verifyToken, updateUserProfile)
  .get(verifyToken, getUserProfile);

router.route("/upload-image").patch(verifyToken, uploadProfileImage);

router
  .route("/upload-image")
  .put(verifyToken, upload.single("image"), uploadProfileImage);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(verifyToken, logout);
router.route("/account-number").get(verifyToken, get_country_account_details);

router.route("/verify-email").post(emailVerification);
router.route("/resendOTP").post(resendVerificationEmail);
router.route("/passwordResetEmail").post(passwordResetEmail);
router.route("/resetPassword").post(resetPassword);

router.route("/get_user/:userId").get(verifyToken, get_A_UserProfile);

module.exports = router;
