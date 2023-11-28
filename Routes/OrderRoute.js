const { Router } = require("express");
const router = Router();
const {
  orderList,
  orderById,
  creatOrder,
  updateOrder,
  deleteOrder,
  userOrder,
} = require("../Controller/OrderController");

router.route("/").get(orderList).post(creatOrder);
router.route("/:id").get(orderById).put(updateOrder).delete(deleteOrder);
router.route("/user-order/:userId").get(userOrder);

module.exports = router;
