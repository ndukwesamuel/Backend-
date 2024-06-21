const { Router } = require("express");
const { V1_register, V1_sendOTP } = require("../../Controller/Usercontrollers");
const router = Router();

router.route("/register").post(V1_register);
router.route("/sendOTP").post(V1_sendOTP);

module.exports = router;
