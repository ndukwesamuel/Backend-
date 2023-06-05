const { Router } = require("express");

const router = Router();
const { verifyToken } = require("../Middleware/auth");
const {
  getData,
  register,
  login,
  home,
  group,
  emailVerification,
  resendOTP,
} = require("../Controller/Controller");

router.route("/getdata").get(getData);
router.route("/user/register").post(register);
router.route("/user/login").post(login);
router.route("/create-group").post(verifyToken, group);
router.route("/verify-email").post(emailVerification);
router.route("/resendOTP").post(resendOTP);

router.route("/home").get(verifyToken, home);

module.exports = router;
