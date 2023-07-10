const { Router } = require("express");

const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  getData,
  register,
  login,
  logout,
  home,
  group,
  emailVerification,
  resendVerificationEmail,
  getAllGroups,
  joinGroup,
  passwordResetEmail,
  resetPassword,
  getCategory,
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  addToCart,
  getCart,
  deleteFromCart,
  decreaseCartItems,
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProduct,
  getProductByCategory,
  payment,
  verifyPayment,
} = require("../Controller/Controller");

router.route("/getdata").get(getData);
router.route("/user/register").post(register);
router.route("/user/login").post(login);
router.route("/user/logout").patch(verifyToken, logout);

router.route("/create-group").post(verifyToken, group);
router.route("/verify-email").post(emailVerification);
router.route("/resendOTP").post(resendVerificationEmail);
router.route("/groups/:groupName/join").get(joinGroup);
router.route("/passwordResetEmail").post(passwordResetEmail);
router.route("/resetPassword").post(resetPassword);

router.route("/groups").get(getAllGroups);

router.route("/category/:id").get(getCategory);
router.route("/categories").get(getAllCategories);
router.route("/category").post(verifyTokenAndAdmin, createCategory);
router.route("/category/:id").delete(verifyTokenAndAdmin, deleteCategory);
router.route("/category/:id").put(verifyTokenAndAdmin, updateCategory);
router.route("/category-products/:name").get(getProductByCategory);

router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getProduct);
router.route("/product").post(verifyTokenAndAdmin, createProduct);
router.route("/product/:id").delete(verifyTokenAndAdmin, deleteProduct);
router.route("/product/:id").put(verifyTokenAndAdmin, updateProduct);

router.route("/cart").get(verifyToken, getCart);
router.route("/cart/addItem").post(verifyToken, addToCart);
router.route("/cart/decreaseItem").patch(verifyToken, decreaseCartItems);
router.route("/cart/deleteItem").delete(verifyToken, deleteFromCart);

router.route("/payment").post(payment);
router.route("/paymentVerification").post(verifyPayment);

router.route("/home").get(verifyToken, home);

module.exports = router;
