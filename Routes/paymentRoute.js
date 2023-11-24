const { Router } = require("express");
const router = Router();
const { payment, verifyPayment } = require("../Controller/paymentController");

router.route("/payment").post(payment);
router.route("/paymentVerification").post(verifyPayment);

module.exports = router;
