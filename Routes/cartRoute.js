const { Router } = require("express");
const router = Router();
const { verifyToken } = require("../Middleware/auth");
const {
  addToCart,
  getCart,
  deleteFromCart,
  decreaseCartItems,
} = require("../Controller/cartController");

router.route("/").get(verifyToken, getCart);
router.route("/addItem").post(verifyToken, addToCart);
router.route("/decreaseItem").patch(verifyToken, decreaseCartItems);
router.route("/deleteItem").delete(verifyToken, deleteFromCart);

module.exports = router;
