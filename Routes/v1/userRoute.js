const { Router } = require("express");
const {
  V1_register,
  V1_sendOTP,
  V1_verifyOTP,
} = require("../../Controller/Usercontrollers");
const router = Router();

router.route("/register").post(V1_register);
router.route("/sendOTP").post(V1_sendOTP);
router.route("/verifyOTP").post(V1_verifyOTP);

module.exports = router;
