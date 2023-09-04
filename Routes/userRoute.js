const { Router } = require("express");
const upload = require("../Middleware/multer");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  updateUserProfile,
  getUserProfile,
  register,
} = require("../Controller/usercontroller");

router.route("/profile").post(updateUserProfile).get(getUserProfile);
router.route("/register").post(register);

module.exports = router;
