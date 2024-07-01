const { Router } = require("express");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  addToCart,
  getCart,
  deleteFromCart,
  decreaseCartItems,
} = require("../Controller/cartController");
const {
  BeninBank,
  AllBeninBank,
  Get_Bank_USer_Can_Pay_with,
} = require("../Controller/BankControler");

router.route("/").get(verifyToken, Get_Bank_USer_Can_Pay_with);
router.route("/benin").post(verifyTokenAndAdmin, BeninBank).get(AllBeninBank);

module.exports = router;
