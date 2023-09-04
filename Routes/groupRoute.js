const { Router } = require("express");
const upload = require("../Middleware/multer");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const { createGroup } = require("../Controller/Group");

router.route("/").post(verifyToken, createGroup);

module.exports = router;
