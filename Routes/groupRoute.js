const { Router } = require("express");
const upload = require("../Middleware/multer");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  createGroup,
  getAllGroups,
  joinGroup,
  getGroupCart,
  AddGroupCart,
  updateSingleGroupCart,
  DeleteSingleGroupCart,
  getMemberGroups,
  CheckoutGroupCart,
} = require("../Controller/Group");

router
  .route("/")
  .post(verifyToken, createGroup)
  .get(verifyTokenAndAdmin, getAllGroups);

router.route("/member").get(verifyToken, getMemberGroups);
router.route("/checkout/:groupId").get(verifyToken, CheckoutGroupCart);

router.route("/:groupId/join").get(verifyToken, joinGroup);
router
  .route("/:groupId/cart")
  .get(verifyToken, getGroupCart)
  .post(verifyToken, AddGroupCart)
  .put(verifyToken, updateSingleGroupCart)
  .delete(verifyToken, DeleteSingleGroupCart);
//   .get(verifyTokenAndAdmin, getAllGroups);

module.exports = router;
