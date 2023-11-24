const { Router } = require("express");
const router = Router();
const { getData } = require("../Controller/Controller");

router.route("/getdata").get(getData);

module.exports = router;
