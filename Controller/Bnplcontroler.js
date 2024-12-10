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

const Cart = require("../Models/Cart");
const mongoose = require("mongoose");
const Order = require("../Models/Order");
const OrderItem = require("../Models/OrderItems");

const KYC_Form_SubmissionA = async (req, res) => {
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
        isKYCVerified: true,
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

// const Loan = require("./models/Loan"); // Import Loan model

const KYC_Form_Submission = async (req, res) => {
  const { phoneNumber, bvn, dob } = req.body;
  const userinfo = req.userProfile;

  try {
    // Update UserProfile with KYC information
    let data_info = await UserProfile.findOneAndUpdate(
      { user: userinfo?.user?._id },
      {
        ...(phoneNumber && { phoneNumber }),
        ...(bvn && { bvn }),
        ...(dob && { dob }),
        isKYCComplete: true,
        isKYCVerified: true,
      },
      { new: true }
    );

    // Check if the user already has a loan document
    let loanDocument = await Loan.findOne({ userId: userinfo?.user?._id });

    if (!loanDocument) {
      // Create a new Loan document for the user
      loanDocument = await Loan.create({
        userId: userinfo?.user?._id,
        loanLimit: 50000, // Default loan limit
        currentLoan: 0, // No active loan
        remainingBalance: 0, // No balance due
        creditworthiness: "Average", // Default creditworthiness
        isLoanActive: false,
      });
    }

    res.status(200).json({
      message: "KYC submitted successfully!",
      userinfo,
      data_info,
      loanDocument,
    });
  } catch (error) {
    res.status(500).json({ message: "Error submitting KYC", error });
  }
};

// const Fetch_Loan_Status = async (req, res) => {
//   // const { phoneNumber, bvn, dob } = req.body;
//   const userinfo = req.userProfile;

//   // let userCountry = userinfo?.user?.country;

//   try {
//     const loan = await Loan.findOne({ userId: userinfo?.user?._id }).sort({
//       createdAt: -1,
//     });

//     if (!loan) {
//       return res
//         .status(404)
//         .json({ message: "No loan records found for this user." });
//     }

//     res.status(200).json({
//       lastLoanAmount: loan.amount,
//       paymentStatus: loan.status,
//       remainingBalance: loan.remainingBalance,
//       nextRepaymentDate: loan.nextRepaymentDate,
//       creditworthiness: loan.creditworthiness,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error submitting KYC", error });
//   }
// };

const Fetch_Loan_Status = async (req, res) => {
  const userinfo = req.userProfile;

  try {
    // Fetch the user's loan profile
    const loan = await Loan.findOne({ userId: userinfo?.user?._id });

    if (!loan) {
      return res
        .status(404)
        .json({ message: "No loan records found for this user." });
    }

    res.status(200).json({
      loanLimit: loan.loanLimit,
      currentLoan: loan.currentLoan,
      remainingBalance: loan.remainingBalance,
      isLoanActive: loan.isLoanActive,
      nextRepaymentDate: loan.nextRepaymentDate,
      creditworthiness: loan.creditworthiness,
      loanHistory: loan.loanHistory, // History of borrow and repayment transactions
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching loan status", error });
  }
};

const Loan_Application_first_load = async (req, res) => {
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

// const Loan_Application = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     let userId = req.user.userId;

//     const userinfo = req.userProfile;

//     if (!userinfo || !userinfo.isKYCComplete) {
//       return res
//         .status(400)
//         .json({ message: "Complete KYC before applying for a loan." });
//     }

//     const cart = await Cart.findOne({ userId })
//       .populate({
//         path: "items.productId",
//         model: "product",
//       })
//       .session(session); // Ensure the query is run within the transaction

//     if (!cart || cart.items.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Cart is empty or does not exist." });
//     }

//     // Order details
//     const orderDetails = {
//       user: userId,
//       products: cart.items.map((item) => ({
//         product: item.productId._id,
//         quantity: item.quantity,
//       })),
//       totalAmount: cart.bill,
//     };

//     // Create a loan for the cart total amount
//     console.log({
//       userId,
//       cart,
//     });

//     const loan = await Loan.create(
//       {
//         userId: userId,
//         amount: cart.bill,
//         remainingBalance: cart.bill,
//         nextRepaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
//       },
//       { session }
//     );

//     // Place the order
//     const order = new Order(orderDetails);
//     await order.save({ session });

//     // Clear the cart
//     cart.items = [];
//     cart.bill = 0;
//     await cart.save({ session });

//     await session.commitTransaction(); // Commit the transaction

//     res.status(201).json({
//       message: "Order placed successfully with a loan!",
//       order,
//       loan,
//     });
//   } catch (error) {
//     await session.abortTransaction(); // Abort the transaction if an error occurs
//     console.log({
//       error: error.message,
//     });
//     res.status(500).json({ message: error.message });
//   } finally {
//     session.endSession();
//   }
// };

// const Loan_Application = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     let userId = req.user.userId;
//     const userinfo = req.userProfile;

//     if (!userinfo || !userinfo.isKYCComplete) {
//       return res
//         .status(400)
//         .json({ message: "Complete KYC before applying for a loan." });
//     }

//     const cart = await Cart.findOne({ userId })
//       .populate({
//         path: "items.productId",
//         model: "product",
//       })
//       .session(session);

//     if (!cart || cart.items.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Cart is empty or does not exist." });
//     }

//     const orderDetails = {
//       user: userId,
//       products: cart.items.map((item) => ({
//         product: item.productId._id,
//         quantity: item.quantity,
//       })),
//       totalAmount: cart.bill,
//     };

//     // Fix: Wrap loan details in an array for `Model.create()`
//     const loan = await Loan.create(
//       [
//         {
//           userId: userId,
//           amount: cart.bill,
//           remainingBalance: cart.bill,
//           nextRepaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
//         },
//       ],
//       { session }
//     );

//     const order = new Order(orderDetails);
//     await order.save({ session });

//     cart.items = [];
//     cart.bill = 0;
//     await cart.save({ session });

//     await session.commitTransaction();

//     res.status(201).json({
//       message: "Order placed successfully with a loan!",
//       order,
//       loan,
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     console.log({
//       error: error.message,
//     });
//     res.status(500).json({ message: error.message });
//   } finally {
//     session.endSession();
//   }
// };

const Loan_Application = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let userId = req.user.userId;
    const userinfo = req.userProfile;

    if (!userinfo || !userinfo.isKYCComplete) {
      return res
        .status(400)
        .json({ message: "Complete KYC before applying for a loan." });
    }

    // console.log({
    //   userId,
    // });

    // const loanALl = await Loan.find();

    // console.log({
    //   aa: loanALl,
    // });

    const loan = await Loan.findOne({ userId: userId }).session(session);
    if (!loan) {
      return res
        .status(400)
        .json({ message: "Loan profile not found. Contact support." });
    }

    // // Check loan status
    // if (loan.isLoanActive && loan.remainingBalance > 0) {
    //   return res.status(400).json({
    //     message:
    //       "You have an active loan. Repay it before applying for a new one.",
    //   });
    // }

    const cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        model: "product",
      })
      .session(session);

    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ message: "Cart is empty or does not exist." });
    }

    const totalAmount = cart.bill;

    if (totalAmount > loan.loanLimit - loan.currentLoan) {
      return res.status(400).json({
        message:
          "Loan limit exceeded. Repay outstanding balance to apply for a new loan.",
      });
    }

    // Update loan details
    loan.currentLoan += totalAmount;
    loan.remainingBalance += totalAmount;
    loan.isLoanActive = true;
    loan.nextRepaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    // Record loan transaction
    loan.loanHistory.push({
      amount: totalAmount,
      type: "Borrowed",
    });

    await loan.save({ session });

    // Process the order
    const orderDetails = {
      user: userId,
      products: cart.items.map((item) => ({
        product: item.productId._id,
        quantity: item.quantity,
      })),
      totalAmount: cart.bill,
    };

    const order = new Order(orderDetails);
    await order.save({ session });

    // Clear the cart
    cart.items = [];
    cart.bill = 0;
    await cart.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      message: "Loan approved and order placed successfully!",
      order,
      loan,
    });
  } catch (error) {
    await session.abortTransaction();
    console.log({
      error: error.message,
    });
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// Fetch Loan Status

module.exports = {
  KYC_Form_Submission,
  Fetch_Loan_Status,
  Loan_Application,
};
