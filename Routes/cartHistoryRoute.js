const { Router } = require("express");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  getAllUserCartHistory,
  getCartHistoryByUserId,
  getAllGroupCartHistory,
  getCartHistoryByGroupId,
  UpdateGroupOrderStatus,
  getRevenues,
} = require("../Controller/userCartHistoryController");

router.route("/all-user").get(verifyToken, getAllUserCartHistory);
router.route("/user").get(verifyToken, getCartHistoryByUserId);
router.route("/all-group").get(verifyToken, getAllGroupCartHistory);
router.route("/group/:id").get(verifyToken, getCartHistoryByGroupId);
router.route("/group-order").post(verifyTokenAndAdmin, UpdateGroupOrderStatus);
router.route("/revenues").get(verifyTokenAndAdmin, getRevenues);

module.exports = router;
