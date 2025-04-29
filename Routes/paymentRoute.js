const { Router } = require("express");
const router = Router();
const {
  payment,
  verifyPayment,
  initializePaystackPayment,
  paystackWebhook,
} = require("../Controller/paymentController");
const { verifyToken } = require("../Middleware/auth");

// LATEST ROUTES
router.route("/").post(verifyToken, initializePaystackPayment);
router.route("/verify").post(verifyToken, verifyPayment);
router.route("/paystack/webhook").post(paystackWebhook);

// OLD ROUTES
router.route("/payment").post(verifyToken, payment);
router.route("/paymentVerification").post(verifyToken, verifyPayment);

module.exports = router;
