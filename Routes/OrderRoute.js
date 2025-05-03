const { Router } = require("express");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");

const {
  userOrderList,
  orderList,
  orderById,
  createOrder,
  updateOrder,
  deleteOrder,
  userOrder,
  PlaceOrderFromCart,
} = require("../Controller/OrderController");

router
  .route("/")
  .post(verifyToken, createOrder)
  .get(verifyTokenAndAdmin, orderList);

router
  .route("/user-order")
  .post(verifyToken, PlaceOrderFromCart)
  // .get(verifyToken, userOrder)
  .get(verifyToken, userOrderList);

router
  .route("/:id")
  .get(verifyTokenAndAdmin, orderById)
  .put(verifyTokenAndAdmin, updateOrder)
  .delete(verifyTokenAndAdmin, deleteOrder);

module.exports = router;
