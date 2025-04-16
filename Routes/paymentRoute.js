const { Router } = require("express");
const router = Router();
const {
  payment,
  verifyPayment,
  initializePaystackPayment,
  paystackWebhook,
} = require("../Controller/paymentController");
const { verifyToken } = require("../Middleware/auth");

router.route("/").post(verifyToken, initializePaystackPayment);
router.route("/verify").post(verifyToken, verifyPayment);
router.route("/paystack/webhook").post(paystackWebhook);

module.exports = router;
