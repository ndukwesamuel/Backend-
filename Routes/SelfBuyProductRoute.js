const { Router } = require("express");
const router = Router();
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
  verifyCountry,
} = require("../Middleware/auth");
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
const { getSelfProduct } = require("../Controller/SelfBuyProduct");

router.route("/").get(verifyToken, verifyCountry, getSelfProduct);
router.route("/benin").post(verifyTokenAndAdmin, BeninBank).get(AllBeninBank);

module.exports = router;
