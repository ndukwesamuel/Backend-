const { Router } = require("express");
const upload = require("../Middleware/multer");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const { createGroup, getAllGroups, joinGroup } = require("../Controller/Group");
const {
  getAllCategories,
  createCategory,
} = require("../Controller/categorycontroler");
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  AdmingetAllProducts,
  createAppImage,
  getAllAppImages,
  updateAppImage,
} = require("../Controller/productController");

router.route("/").get(getAllProducts).post(verifyTokenAndAdmin, createProduct);
router
  .route("/:id")
  .patch(verifyTokenAndAdmin, updateProduct)
  .get(getProduct)
  .delete(verifyTokenAndAdmin, deleteProduct);
router.route("/user-product").get(getAllProducts);
router
  .route("/adminProductimage")
  .get(verifyTokenAndAdmin, getAllAppImages)
  .post(verifyTokenAndAdmin, createAppImage)
  .patch(verifyTokenAndAdmin, updateAppImage);

module.exports = router;
