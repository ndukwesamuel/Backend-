const { Router } = require("express");

const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  getData,
  register,
  login,
  home,
  group,
  emailVerification,
  resendOTP,
  getAllGroups,
  joinGroup,
  passwordResetEmail,
  getCategory,
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  addToCart,
  getCart,
  removeFromCart,
  decreaseCartItems,
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProduct,
  getProductByCategory,
} = require("../Controller/Controller");

router.route("/getdata").get(getData);
router.route("/user/register").post(register);
router.route("/user/login").post(login);
router.route("/create-group").post(verifyToken, group);
router.route("/verify-email").post(emailVerification);
router.route("/resendOTP").post(resendOTP);
router.route("/groups/:groupName/join").get(joinGroup);
router.route("/PasswordResetOTP").post(passwordResetEmail);

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

router.route("/cart/:userId").get(getCart);
router.route("/cart/:userId/items").post(addToCart);
router.route("/cart/:userId/items/:productId").patch(decreaseCartItems);
router.route("/cart/:userId/items/:productId").delete(removeFromCart);

router.route("/home").get(verifyToken, home);

module.exports = router;
