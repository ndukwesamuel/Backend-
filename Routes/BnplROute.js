const { Router } = require("express");
const router = Router();
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
  verifyCountry,
} = require("../Middleware/auth");

const { getSelfProduct } = require("../Controller/SelfBuyProduct");
const {
  KYC_Form_Submission,
  Fetch_Loan_Status,
  Loan_Application,
} = require("../Controller/Bnplcontroler");

router
  .route("/")
  .post(verifyToken, verifyCountry, KYC_Form_Submission)
  .get(verifyToken, verifyCountry, Fetch_Loan_Status);

router
  .route("/loan")
  // .post(verifyToken, verifyCountry, KYC_Form_Submission)
  .post(verifyToken, verifyCountry, Loan_Application);

module.exports = router;
