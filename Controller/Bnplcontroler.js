const {
  handleErrors,
  getImageId,
} = require("../Middleware/errorHandler/function");

const Category = require("../Models/Category");
const Product = require("../Models/Products");
const { findProduct } = require("../services/ProductService");
const { findUserProfileById } = require("../services/userService");
const cloudinary = require("../utils/Cloudinary");
const User = require("../Models/Users");
const UserProfile = require("../Models/UserProfile");
const Loan = require("../Models/BNPLmodel");

const KYC_Form_Submission = async (req, res) => {
  const { phoneNumber, bvn, dob } = req.body;
  const userinfo = req.userProfile;

  // let userCountry = userinfo?.user?.country;

  try {
    let data_info = await UserProfile.findOneAndUpdate(
      { user: userinfo?.user?._id },
      {
        ...(phoneNumber && { phoneNumber }),
        ...(bvn && { bvn }),
        ...(dob && { dob }),
        isKYCComplete: true,
      },
      { new: true }
    );

    res.status(200).json({
      message: "KYC submitted successfully!",
      userinfo,
      data_info,
    });
  } catch (error) {
    res.status(500).json({ message: "Error submitting KYC", error });
  }
};

const Fetch_Loan_Status = async (req, res) => {
  // const { phoneNumber, bvn, dob } = req.body;
  const userinfo = req.userProfile;

  // let userCountry = userinfo?.user?.country;

  try {
    const loan = await Loan.findOne({ userId: userinfo?.user?._id }).sort({
      createdAt: -1,
    });

    if (!loan) {
      return res
        .status(404)
        .json({ message: "No loan records found for this user." });
    }

    res.status(200).json({
      lastLoanAmount: loan.amount,
      paymentStatus: loan.status,
      remainingBalance: loan.remainingBalance,
      nextRepaymentDate: loan.nextRepaymentDate,
      creditworthiness: loan.creditworthiness,
    });
  } catch (error) {
    res.status(500).json({ message: "Error submitting KYC", error });
  }
};

const Loan_Application = async (req, res) => {
  // const { phoneNumber, bvn, dob } = req.body;
  const userinfo = req.userProfile;
  const { amount } = req.body;
  // let userCountry = userinfo?.user?.country;

  try {
    if (!userinfo || !userinfo.isKYCComplete) {
      return res
        .status(400)
        .json({ message: "Complete KYC before applying for a loan." });
    }

    // Create new loan application
    const loan = await Loan.create({
      userId: userinfo.user._id,
      amount,
      remainingBalance: amount,
      nextRepaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    res
      .status(201)
      .json({ message: "Loan application submitted successfully!", loan });
  } catch (error) {
    res.status(500).json({ message: "Error submitting KYC", error });
  }
};

// Fetch Loan Status

module.exports = {
  KYC_Form_Submission,
  Fetch_Loan_Status,
  Loan_Application,
};
