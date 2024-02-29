const { Router } = require("express");
const { verifyToken, verifyTokenAndAdmin } = require("../Middleware/auth");
const {
  receiptUploader,
  getAllReceipt,
  getReceiptById,
  AddMoneyTo,
  Get__user__Transaction__History,
  TransferMoneyToGroup,
  Get__group__Transaction__History,
  GroupPaysForAProduct,
  GetUserMoney,
} = require("../Controller/wallet");
const upload = require("../Middleware/multer");
const router = Router();

router.route("/").post(verifyToken, AddMoneyTo).get(verifyToken, GetUserMoney);

router.route("/receipt").get(verifyTokenAndAdmin, getAllReceipt);
router.route("/receipt/:id").get(verifyTokenAndAdmin, getReceiptById);

router
  .route("/receipt-upload")
  .post(verifyToken, upload.single("image"), receiptUploader);

router.route("/history").get(verifyToken, Get__user__Transaction__History);

router.route("/send-to-group-wallet").post(verifyToken, TransferMoneyToGroup);
router
  .route("/send-out-of-group-wallet")
  .post(verifyToken, GroupPaysForAProduct);

// // router.route("/get-all-users-history").get(getAllUsersHistory);
router
  .route("/:groupId/get-all-group-transaction-history")
  .get(verifyToken, Get__group__Transaction__History);

module.exports = router;
