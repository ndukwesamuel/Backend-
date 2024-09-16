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
  Group_admin_add_remove_members,
  All_Group_members_Info,
  All_User_That_can_join_Group,
  Group__add_members,
  Group__Remove_members,
  usergetAllGroups,
} = require("../Controller/Group");

router.route("/").post(verifyToken, createGroup).get(verifyToken, getAllGroups);
router.route("/all").get(verifyTokenAndAdmin, getAllGroupMembers);
router.route("/user-get-all-group").get(verifyToken, usergetAllGroups);
router.route("/member").get(verifyToken, getMemberGroups);
router.route("/checkout").post(verifyToken, CheckoutGroupCart);

router.route("/:groupId/join").get(verifyToken, joinGroup);
router.route("/addToCart").post(verifyToken, AddGroupCart);

router.route("/add_member").post(verifyToken, Group__add_members);
router.route("/remove_member").post(verifyToken, Group__Remove_members);

router
  .route("/group_members/:groupId")
  .get(verifyToken, All_Group_members_Info);
router
  .route("/eligible-users/:groupId")
  .get(verifyToken, All_User_That_can_join_Group);

router
  .route("/:groupId/cart")
  .get(verifyToken, getGroupCart)
  .put(verifyToken, updateSingleGroupCart)
  .delete(verifyToken, DeleteSingleGroupCart);
//   .get(verifyTokenAndAdmin, getAllGroups);

module.exports = router;
