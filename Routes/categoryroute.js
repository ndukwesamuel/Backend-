const { Router } = require("express");
const upload = require("../Middleware/multer");
const router = Router();
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const { createGroup, getAllGroups, joinGroup } = require("../Controller/Group");
const {
  getAllCategories,
  createCategory,
  getProductByCategory,
} = require("../Controller/categorycontroler");

router
  .route("/")
  .get(getAllCategories)
  .post(verifyTokenAndAdmin, upload.single("image"), createCategory);

router.route("/:categoryName").get(getProductByCategory);
module.exports = router;