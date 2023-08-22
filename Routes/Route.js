const { Router } = require("express");

const upload = require("../Middleware/multer");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  register,
  login,
  logout,
  emailVerification,
  resendVerificationEmail,
  passwordResetEmail,
  resetPassword,
} = require("../Controllers/userController");
const {
  payment,
  verifyPayment,
  createCustomerAccount,
} = require("../Controllers/paymentController");
const {
  addToCart,
  getCart,
  deleteFromCart,
  decreaseCartItems,
} = require("../Controllers/cartController");
const {
  getCategory,
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} = require("../Controllers/categoryController");

const {
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProduct,
  getProductByCategory,
  searchProduct,
} = require("../Controllers/productController");
const {
  createGroup,
  getAllGroups,
  joinGroup,
  deleteGroup,
} = require("../Controllers/groupController");

router.route("/user/register").post(register);
router.route("/user/login").post(login);
router.route("/user/logout").get(verifyToken, logout);

router.route("/verify-email").post(emailVerification);
router.route("/resendOTP").post(resendVerificationEmail);
router.route("/passwordResetEmail").post(passwordResetEmail);
router.route("/resetPassword").post(resetPassword);

router.route("/create-group").post(verifyToken, createGroup);
router.route("/groups").get(getAllGroups);
router.route("/groups/:groupName/join").post(verifyToken, joinGroup);
router.route("/groups/:groupName/delete").delete(verifyToken, deleteGroup);

router.route("/category/:name").get(getCategory);
router.route("/categories").get(getAllCategories);
router
  .route("/category")
  .post(verifyTokenAndAdmin, upload.single("image"), createCategory);
router
  .route("/category/:id")
  .delete(verifyTokenAndAdmin, upload.single("image"), deleteCategory);
router
  .route("/category/:id")
  .put(verifyTokenAndAdmin, upload.single("image"), updateCategory);
router.route("/category-products/:name").get(getProductByCategory);

router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getProduct);
router
  .route("/product")
  .post(verifyTokenAndAdmin, upload.single("image"), createProduct);
router.route("/product/:id").delete(deleteProduct);
router
  .route("/product/:id")
  .put(verifyTokenAndAdmin, upload.single("image"), updateProduct);

router.route("/cart").get(verifyToken, getCart);
router.route("/cart/addItem").post(verifyToken, addToCart);
router.route("/cart/decreaseItem").patch(verifyToken, decreaseCartItems);
router.route("/cart/deleteItem").delete(verifyToken, deleteFromCart);

router.route("/search").get(searchProduct);
router.route("/payment").post(verifyToken, payment);
router.route("/paymentVerification").post(verifyToken, verifyPayment);
router.route("/customerAccount").post(createCustomerAccount);

module.exports = router;
