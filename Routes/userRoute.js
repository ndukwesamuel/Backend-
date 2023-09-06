const { Router } = require("express");
const upload = require("../Middleware/multer");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  getUserProfile,
  updateUserProfile,
  register,
  logout,
} = require("../Controller/Usercontrollers");

router.route("/profile").post(updateUserProfile).get(getUserProfile);
router.route("/register").post(register);
router.route("/logout").get(verifyToken, logout);

module.exports = router;
