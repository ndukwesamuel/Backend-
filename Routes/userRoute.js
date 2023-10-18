const { Router } = require("express");
const upload = require("../Middleware/multer");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  getUserProfile,
  updateUserProfile,
  register,
  login,
  logout,
} = require("../Controller/Usercontrollers");

router
  .route("/profile")
  .put(verifyToken, upload.single("image"), updateUserProfile)
  .get(verifyToken, getUserProfile);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(verifyToken, logout);

module.exports = router;
