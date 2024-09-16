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
} = require("../Controller/productcontroler");

router
  .route("/")
  .get(verifyTokenAndAdmin, AdmingetAllProducts)
  .post(verifyTokenAndAdmin, upload.single("image"), createProduct);

router.route("/user-product").get(verifyToken, getAllProducts);
router
  .route("/:id")
  .put(verifyTokenAndAdmin, upload.single("image"), updateProduct)
  .get(getProduct)
  .delete(verifyTokenAndAdmin, deleteProduct);

module.exports = router;
