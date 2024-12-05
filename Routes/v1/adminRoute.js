const { createAdminUser } = require("../../Controller/Admin/v1/adminUser");
const { verifyTokenAndAdmin } = require("../../Middleware/auth");
const { createCombo } = require("../../Controller/combo");

const { Router } = require("express");
const router = Router();

router.route("/").post(verifyTokenAndAdmin, createCombo);

router.route("/create-admin").post(createAdminUser);
router.route("/create-combo").post(verifyTokenAndAdmin, createCombo);

module.exports = router;
