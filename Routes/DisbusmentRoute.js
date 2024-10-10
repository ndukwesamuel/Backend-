const { Router } = require("express");
const upload = require("../Middleware/multer");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const { Group_admin_add_remove_members } = require("../Controller/Group");
const { RiwandaDisbusmentMobileMoney } = require("../Controller/wallet");

router.route("/").post(RiwandaDisbusmentMobileMoney);

module.exports = router;
