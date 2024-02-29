const { Router } = require("express");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  addToCart,
  getCart,
  deleteFromCart,
  decreaseCartItems,
} = require("../Controller/cartController");
const { BeninBank, AllBeninBank } = require("../Controller/BankControler");

router.route("/benin").post(verifyTokenAndAdmin, BeninBank).get(AllBeninBank);

module.exports = router;
