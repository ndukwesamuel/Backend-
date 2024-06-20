const { Router } = require("express");
const { V1_register } = require("../../Controller/Usercontrollers");
const router = Router();

router.route("/register").post(V1_register);

module.exports = router;
