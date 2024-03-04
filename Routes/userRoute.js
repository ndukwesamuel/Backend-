const { Router } = require("express");
const upload = require("../Middleware/multer");
const router = Router();
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
} = require("../Controller/Usercontrollers");
const {
  emailVerification,
  resendVerificationEmail,
} = require("../Controller/verificationController");
router
  .route("/profile")
  .patch(verifyToken, updateUserProfile)
  .get(verifyToken, getUserProfile);

router.route("/").get(verifyTokenAndAdmin, getAllUser);
router
  .route("/upload-image")
  .put(verifyToken, upload.single("image"), uploadProfileImage);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(verifyToken, logout);
router.route("/verify-email").post(emailVerification);
router.route("/resendOTP").post(resendVerificationEmail);
router.route("/passwordResetEmail").post(passwordResetEmail);
router.route("/resetPassword").post(resetPassword);

module.exports = router;
