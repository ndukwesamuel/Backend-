const { createAdminUser } = require("../Controller/Admin/v1/adminUser");
const { verifyTokenAndAdmin, verifyToken } = require("../Middleware/auth");
const {
  createCombo,
  getAllCombo,
  placeComboOrder,
  getUserOrders,
  AdmingetAllCombo,
} = require("../Controller/combo");

const { Router } = require("express");
const router = Router();

router.route("/").get(verifyToken, getAllCombo);
router
  .route("/order")
  .post(verifyToken, placeComboOrder)
  .get(verifyToken, getUserOrders);
router
  .route("/admin")
  .post(verifyTokenAndAdmin, createCombo)
  .get(verifyTokenAndAdmin, AdmingetAllCombo);

module.exports = router;
