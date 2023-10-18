const { Router } = require("express");
const upload = require("../Middleware/multer");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  getData,
  register,
  login,
  logout,
  home,
  createGroup,
  emailVerification,
  resendVerificationEmail,
  getAllGroups,
  joinGroup,
  deleteGroup,
  passwordResetEmail,
  resetPassword,
  getCategory,
  getAllCategories,
  // createCategory,
  deleteCategory,
  updateCategory,
  addToCart,
  getCart,
  deleteFromCart,
  decreaseCartItems,
  getAllProducts,
  createProduct,
  // deleteProduct,
  // updateProduct,
  getProduct,
  // getProductByCategory,
  payment,
  verifyPayment,
} = require("../Controller/Controller");

router.route("/getdata").get(getData);
// router.route("/user/register").post(register);
// router.route("/user/login").post(login);
// router.route("/user/logout").get(verifyToken, logout);

router.route("/verify-email").post(emailVerification);
router.route("/resendOTP").post(resendVerificationEmail);
router.route("/passwordResetEmail").post(passwordResetEmail);
router.route("/resetPassword").post(resetPassword);

router.route("/create-group").post(verifyToken, createGroup);
router.route("/groups").get(getAllGroups);
router.route("/groups/:groupName/join").post(verifyToken, joinGroup);
router.route("/groups/:groupName/delete").delete(verifyToken, deleteGroup);

router.route("/category/:id").get(getCategory);
// router.route("/categories").get(getAllCategories);
// router
//   .route("/category")
//   .post(verifyTokenAndAdmin, upload.single("image"), createCategory);
router
  .route("/category/:id")
  .delete(verifyTokenAndAdmin, upload.single("image"), deleteCategory);
router
  .route("/category/:id")
  .put(verifyTokenAndAdmin, upload.single("image"), updateCategory);
// router.route("/category-products/:name").get(getProductByCategory);

// router.route("/products").get(getAllProducts);
// router.route("/product/:id").get(getProduct);
// router
//   .route("/product")
//   .post(verifyTokenAndAdmin, upload.single("image"), createProduct);
// router.route("/product/:id").delete(deleteProduct);
// router
//   .route("/product/:id")
//   .put(verifyTokenAndAdmin, upload.single("image"), updateProduct);

// router.route("/cart").get(verifyToken, getCart);
// router.route("/cart/addItem").post(verifyToken, addToCart);
// router.route("/cart/decreaseItem").patch(verifyToken, decreaseCartItems);
// router.route("/cart/deleteItem").delete(verifyToken, deleteFromCart);

router.route("/payment").post(payment);
router.route("/paymentVerification").post(verifyPayment);

router.route("/home").get(verifyToken, home);

module.exports = router;
