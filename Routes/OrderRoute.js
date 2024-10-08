const { Router } = require("express");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");

const {
  orderList,
  orderById,
  createOrder,
  updateOrder,
  deleteOrder,
  userOrder,
} = require("../Controller/OrderController");

router.route("/user-order").get(verifyToken, userOrder);
router
  .route("/")
  .post(verifyToken, createOrder)
  .get(verifyTokenAndAdmin, orderList);
router
  .route("/:id")
  .get(verifyTokenAndAdmin, orderById)
  .put(verifyTokenAndAdmin, updateOrder)
  .delete(verifyTokenAndAdmin, deleteOrder);

module.exports = router;
