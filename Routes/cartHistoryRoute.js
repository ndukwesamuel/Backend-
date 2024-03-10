const { Router } = require("express");
const router = Router();
const { verifyToken } = require("../Middleware/auth");
const {
  getAllUserCartHistory,
  getCartHistoryByUserId,
  getAllGroupCartHistory,
  getCartHistoryByGroupId,
} = require("../Controller/userCartHistoryController");

router.route("/all-user").get(verifyToken, getAllUserCartHistory);
router.route("/user").get(verifyToken, getCartHistoryByUserId);
router.route("/all-group").get(verifyToken, getAllGroupCartHistory);
router.route("/group/:id").get(verifyToken, getCartHistoryByGroupId);

module.exports = router;
