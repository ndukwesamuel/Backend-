const { createAdminUser } = require("../Controller/Admin/v1/adminUser");
const { verifyTokenAndAdmin, verifyToken } = require("../Middleware/auth");
const {
  // createCombo,
  getAllCombo,
  placeComboOrder,
  getUserOrders,
  AdmingetAllCombo,
} = require("../Controller/combo");
const {
  createCombo,
  getAllCombos,
  getComboById,
  updateCombo,
  deleteCombo,
} = require("../Controller/comboController");
const { Router } = require("express");
const {
  validateData,
  parseMultipartJson,
} = require("../Middleware/schemaValidation/validation");
const { comboSchema } = require("../Middleware/schemaValidation/comboSchema");
const router = Router();

router.route("/").get(verifyToken, getAllCombo);
router
  .route("/admin")
  .post(
    parseMultipartJson,
    validateData(comboSchema),
    verifyTokenAndAdmin,
    createCombo
  )
  .get(getAllCombos);
router
  .route("/order")
  .post(verifyToken, placeComboOrder)
  .get(verifyToken, getUserOrders);
router
  .route("/:id")
  .get(getComboById)
  .patch(
    verifyTokenAndAdmin,

    parseMultipartJson,
    validateData(comboSchema),
    updateCombo
  )
  .delete(verifyTokenAndAdmin, deleteCombo);

module.exports = router;
