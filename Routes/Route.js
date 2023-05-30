const { Router } = require("express");

const router = Router();

const { getData, register } = require("../Controller/Controller");

router.route("/getdata").get(getData);
router.route("/user/register").post(register);

module.exports = router;
