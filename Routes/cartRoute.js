const express = require("express");
const router = express.Router();
const { verifyToken } = require("../Middleware/auth");
const {
  addToCart,
  getCart,
  deleteFromCart,
  decreaseCartItems,
} = require("../Controller/cartController");

router.route("/").get(verifyToken, getCart);

// .post(verifyToken, addToCart);
// .all(methodNotAllowed);

router.route("/").get(verifyToken, getCart);
router.route("/addItem").get(verifyToken, addToCart);
router.route("/decreaseItem").get(verifyToken, decreaseCartItems);
router.route("/deleteItem").delete(verifyToken, deleteFromCart);

module.exports = router;
