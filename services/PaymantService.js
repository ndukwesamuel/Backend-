const customError = require("../utils/customError");
const { findUserByEmail } = require("./userService");
const User = require("../Models/Users");

const mongoose = require("mongoose");
const { CreditUser } = require("../Models/Transaction");

// async function Flutterwave_Payment(data) {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     if (data?.data?.processor_response !== "Transaction Successful") {
//       throw customError(
//         404,
//         `${data?.event}-- ${data?.data?.processor_response}`
//       );
//     }

//     const userinfo = await User.findOne({
//       email: data?.data?.customer?.email.toLowerCase(),
//     }).session(session); // Attach the session to the query
//     if (!userinfo) {
//       throw customError(404, "User not found");
//     }

//     const newamount = parseFloat(data?.data?.amount);
//     userinfo.wallet += newamount;

//     const newcreditUser = new CreditUser({
//       user: userinfo._id,
//       amount: newamount,
//       description: data?.data?.narration,
//     });

//     await newcreditUser.save({ session }); // Save with the session
//     await userinfo.save({ session }); // Save with the session

//     await session.commitTransaction();
//     session.endSession();

//     return { userinfo, data };
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// }

async function Flutterwave_Payment(data) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the payment was successful
    if (data?.data?.processor_response !== "Transaction Successful") {
      throw customError(
        404,
        `${data?.event}-- ${data?.data?.processor_response}`
      );
    }

    // Find the user by email
    const userinfo = await User.findOne({
      email: data?.data?.customer?.email.toLowerCase(),
    }).session(session); // Attach the session to the query

    if (!userinfo) {
      throw customError(404, "User not found");
    }

    // Update user wallet balance
    const newamount = parseFloat(data?.data?.amount);
    userinfo.wallet += newamount;

    // Create a credit log for the user
    const newcreditUser = new CreditUser({
      user: userinfo._id,
      amount: newamount,
      description: data?.data?.narration,
    });

    // Save the credit log and user wallet update
    await newcreditUser.save({ session });
    await userinfo.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return { userinfo, data };
  } catch (error) {
    // Abort transaction in case of error
    await session.abortTransaction();
    session.endSession();

    console.error("Error processing payment: ", error);
    throw error;
  }
}

module.exports = {
  Flutterwave_Payment,
};
