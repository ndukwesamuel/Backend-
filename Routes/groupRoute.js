const { Router } = require("express");
const upload = require("../Middleware/multer");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  createGroup,
  getAllGroups,
  getAllGroupMembers,
  joinGroup,
  getGroupCart,
  AddGroupCart,
  updateSingleGroupCart,
  DeleteSingleGroupCart,
  getMemberGroups,
  CheckoutGroupCart,
  GroupcartCheckout,
} = require("../Controller/Group");

router.route("/").post(verifyToken, createGroup).get(verifyToken, getAllGroups);
router.route("/all").get(verifyTokenAndAdmin, getAllGroupMembers);
router.route("/member").get(verifyToken, getMemberGroups);
router.route("/checkout").post(verifyToken, CheckoutGroupCart);

router.route("/:groupId/join").get(verifyToken, joinGroup);
router.route("/addToCart").post(verifyToken, AddGroupCart);

router
  .route("/:groupId/cart")
  .get(verifyToken, getGroupCart)
  .put(verifyToken, updateSingleGroupCart)
  .delete(verifyToken, DeleteSingleGroupCart);
//   .get(verifyTokenAndAdmin, getAllGroups);

module.exports = router;
