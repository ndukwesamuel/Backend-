const { Router } = require("express");
const router = Router();
const { payment, verifyPayment } = require("../Controller/paymentController");
const { verifyToken } = require("../Middleware/auth");

router.route("/payment").post(payment);
router.route("/paymentVerification").post(verifyToken, verifyPayment);

module.exports = router;
