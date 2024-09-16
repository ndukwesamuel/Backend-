const { Router } = require("express");
const upload = require("../Middleware/multer");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  getAllCategories,
  getCategory,
  createCategory,
  getProductByCategory,
  updateCategory,
  deleteCategory,
} = require("../Controller/categorycontroler");

router
  .route("/")
  .get(getAllCategories)
  .post(verifyTokenAndAdmin, upload.single("image"), createCategory);

router.route("/:name").get(getProductByCategory);
router
  .route("/:id")
  .get(verifyTokenAndAdmin, getCategory)
  .put(verifyTokenAndAdmin, updateCategory)
  .delete(verifyTokenAndAdmin, deleteCategory);

module.exports = router;
