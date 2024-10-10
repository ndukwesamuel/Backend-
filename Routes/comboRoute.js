const { createAdminUser } = require("../Controller/Admin/v1/adminUser");
const { verifyTokenAndAdmin, verifyToken } = require("../Middleware/auth");
const { createCombo, getAllCombo } = require("../Controller/combo");

const { Router } = require("express");
const router = Router();

router.route("/").get(verifyToken, getAllCombo);
router.route("/admin").post(verifyTokenAndAdmin, createCombo);

module.exports = router;
