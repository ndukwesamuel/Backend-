const User = require("../Models/Users");
const Order = require("../Models/Order");

const Group = require("../Models/Group");
const cloudinary = require("../utils/Cloudinary");
const { getImageId } = require("../Middleware/errorHandler/function");
const { CreditUser, GroupTransfer } = require("../Models/Transaction");
const Receipt = require("../Models/receipt");
const { StatusCodes } = require("http-status-codes");
const { findUserProfileById } = require("../services/userService");
const { v4: uuidv4 } = require("uuid");
const uuid = uuidv4();
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  // "FLWPUBK_TEST-5efc88def75d1c44d4a4535b31bc4c8a-X",
  // "FLWSECK_TEST-67a4462102e95e67069e7f5f98c80369-X"
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);
const receiptUploader = async (req, res) => {
  try {
    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "webuyam/receipts",
    });

    const newReceipt = new Receipt({
      user: req.user.userId,
      receipt: upload.secure_url,
      amount: req.body.amount,
    });

    newReceipt.save();
    res.status(200).json({ message: "Receipt uploaded" });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};
const getReceiptById = async (req, res) => {
  const receipts = await Receipt.findById(req.params.id).populate(
    "user",
    "fullName"
  );
  try {
    if (receipts.length === 0 || receipts.length < 1) {
      return res.status(404).json({ message: "No receipt found!" });
    }
    res.status(200).json({ message: receipts });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const UpdateUserWalletwithReceipt = async (req, res) => {
  const { status, receiptId } = req.body;

  // Check if the status is valid
  if (status !== "approved" && status !== "declined") {
    return res
      .status(400)
      .json({ message: "Invalid status. Use 'approved' or 'declined'" });
  }

  try {
    //   // Find the receipt by ID
    const receipt = await Receipt.findById(receiptId).populate("user");

    // Check if the receipt exists
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    // Check if the receipt is pending
    if (receipt.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Receipt is not pending and cannot be modified` });
    }
    // Update the receipt status
    receipt.status = status;
    await receipt.save();

    // Update user's wallet if approved
    if (status === "approved") {
      // Assuming the receipt amount should be added to the existing wallet balance
      receipt.user.wallet += receipt.amount;
      await receipt.user.save();
    }
    res
      .status(200)
      .json({ data: receipt, message: "Receipt updated successfully" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const getAllReceipt = async (req, res) => {
  const receipts = await Receipt.find().populate("user", "fullName");
  try {
    if (receipts.length === 0 || receipts.length < 1) {
      return res
        .status(404)
        .json({ message: "No receipt has been uploaded yet!" });
    }
    res.status(200).json({ message: receipts });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const updateUserWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $inc: { wallet: parseFloat(amount) } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found", data: user });
    }

    return res.json({ message: "User wallet updated successfully", user });
  } catch (error) {
    console.error("Error updating user wallet:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

const AddMoneyTo = async (req, res) => {
  const { userId, amount, description } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found", data: user });
  }
  const newamount = parseFloat(amount);
  user.wallet += newamount;

  const newcreditUser = new CreditUser({
    user: user._id,
    amount: newamount,
    description: description,
  });
  userdeposit = await newcreditUser.save();

  await user.save();
  res.status(200).json({
    message: "Wallet credited successfully",
    walletBalance: user,
    userdeposit,
  });
};

const GetUserMoney = async (req, res) => {
  let user = req.user.userId;
  let userwalet = await User.findById(user);

  if (!user) {
    return res.status(404).json({ message: "User not found", data: user });
  }

  res.status(200).json({
    message: "Wallet credited successfully",
    wallet: userwalet.wallet,
  });
};

const TransferMoneyToGroup = async (req, res) => {
  const { userId, groupId, amount, description } = req.body;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  let check_member_in_group = group.members.includes(userId);

  console.log({ check_member_in_group });

  if (!check_member_in_group) {
    return res
      .status(400)
      .json({ message: "You are not a member of this group" });
  }
  //       // Check if the user has enough balance
  const newamount = parseFloat(amount);

  if (user.wallet < newamount) {
    return res
      .status(400)
      .json({ message: `Insufficient balance  ${user.wallet}` });
  }

  // Deduct the amount from the user's wallet
  user.wallet -= newamount;

  // Add the amount to the group wallet
  group.wallet += newamount;

  const newGroupTransfer = new GroupTransfer({
    sender: user._id,
    group: group._id,
    amount: newamount,
    description: description,
  });
  UserSendMoneytToGroup = await newGroupTransfer.save();

  await user.save();
  await group.save();

  res.status(200).json({
    message: "Successfull Transfered to Group Wallet credited successfully",
    UserSendMoneytToGroup,
  });
};

const getAllUsersHistory = async (req, res) => {
  try {
    const credits = await CreditUser.find().populate("user");
    const grouptransaction = await GroupTransfer.find().populate("user");

    return res.status(200).json({ credits, grouptransaction });
  } catch (error) {
    return res.status(500).json({ error: "Could not fetch credit records" });
  }
};

const Get__user__Transaction__History = async (req, res) => {
  console.log("Get__user__Transaction__History");
  let userId = req.user.userId;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const grouptransfer = await GroupTransfer.find({ sender: user._id });
    const credited = await CreditUser.find({ user: user._id });

    const grouptransferObjects = grouptransfer.map((item) => item.toObject());
    const creditedObjects = credited.map((item) => item.toObject());

    const combinedArray = [...grouptransferObjects, ...creditedObjects];

    combinedArray.sort((a, b) => b.createdAt - a.createdAt);

    res.json({ transactionHistory: combinedArray });

    // res.json({ grouptransferObjects, creditedObjects });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Could not fetch transaction records" });
  }
};

const Get__group__Transaction__History = async (req, res) => {
  let groupId = req.params.groupId;
  let userId = req.user.userId;

  try {
    const group = await Group.findById(groupId);
    const check_member_in_group = group.members.includes(userId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (!check_member_in_group) {
      return res
        .status(404)
        .json({ message: "You are not a member of this group" });
    }

    const grouptransfer = await GroupTransfer.find({
      group: group._id,
    })
      .populate("sender", "fullName")
      .populate("group", "name");

    res.json({ transactionHistory: grouptransfer });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Could not fetch transaction records" });
  }
};

const GroupPaysForAProduct = async (req, res) => {
  const { groupId, amount, description, type } = req.body;
  let userId = req.user.userId;

  if (type !== "groupPurchase") {
    return res
      .status(404)
      .json({ message: "Type not found check the transcation type" });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  let check_member_in_group = group.admins.includes(userId);

  if (!check_member_in_group) {
    return res
      .status(400)
      .json({ message: "You are not a Admin So you cant make payment " });
  }

  console.log({ check_member_in_group });

  const newamount = parseFloat(amount);

  if (group.wallet < newamount) {
    return res
      .status(400)
      .json({ message: `Insufficient balance  ${group.wallet}` });
  }

  // Deduct the amount from the user's wallet
  // user.wallet -= newamount;

  // // Add the amount to the group wallet
  group.wallet += newamount;

  const newGroupTransfer = new GroupTransfer({
    group: group._id,
    amount: newamount,
    description: description,
    type,
  });
  UserSendMoneytToGroup = await newGroupTransfer.save();
  await group.save();

  return res.status(200).json({
    message: "Successfull Transfered to Group Wallet credited successfully",
    group,
  });
};

function generateUniqueNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const dateString = `${year}${month}${day}${hours}${minutes}${seconds}`;
  const uniqueNumber = `${uuid}-${dateString}`;

  return uniqueNumber;
}

const fluterwave_fun_money = async (req, res) => {
  const { phone_number, amount } = req.body;

  let user = req.user?.userId;

  const user_details = await findUserProfileById(user);

  const payload = {
    tx_ref: `tx_ref-${generateUniqueNumber()}-${amount}`,
    order_id: `order_id-${generateUniqueNumber()}-RWF`,
    amount: amount,
    currency: "RWF",
    phone_number: phone_number,
    email: user_details?.user?.email,
    fullname: user_details?.user?.fullName, //"Example User",
  };
  const response = await flw.MobileMoney.rwanda(payload);

  res.status(200).json({
    data: response,
  });
};

const ProductOrderpaymentForpersonalProductfluterwave_fun_money = async (
  req,
  res
) => {
  let { userId } = req.user;
  const { orderId } = req.body;
  const user_details = await findUserProfileById(userId);

  const orders = await Order.findOne({ _id: orderId })
    .populate("products.product")
    .populate("user");

  if (!orders) {
    return res.status(404).json({ message: "Order not found" });
  }

  let payload = {
    tx_ref: `tx_ref-${generateUniqueNumber()}-${orders?.totalAmount}`,
    order_id: `order_id-${generateUniqueNumber()}-${
      user_details?.user?.country
    }`,
    amount: orders?.totalAmount,
    currency: "RWF",
    phone_number: "09167703400",
    email: user_details?.user?.email,
    fullname: user_details?.user?.fullName, //"Example User",
  };

  // Testing tip
  // In Test Mode, you can complete the transaction by visiting the returned redirect URL and entering 123456 as the OTP.
  const response = await flw.MobileMoney.rwanda(payload);

  res.status(200).json({
    data: response,
    data1: { user_details, orders, ff: payload },
  });
};

const fluterwave_webhook = async (req, res) => {
  const payload = req.body;
  console.log(payload);
  res.status(200).json({ message: "hello flutterwave post", data: payload });
};

const RiwandaDisbusmentMobileMoney = async (req, res) => {
  const { account_number, amount, currency, beneficiary_name, mobile_number } =
    req.body;

  try {
    const details = {
      account_bank: "MTN", // Rwanda uses MTN for mobile money
      account_number: account_number, // Rwanda mobile number with country code e.g., 250700000000
      amount: amount, // Amount in RWF (Rwandan Francs)
      currency: currency || "RWF", // Default to Rwandan Franc
      beneficiary_name: beneficiary_name, // Recipient's name
      meta: {
        sender: "Your Business Name", // Replace with your business name
        sender_country: "RW", // Rwanda
        mobile_number: mobile_number, // Sender's mobile number
      },
    };

    // Initiate the transfer
    const response = await flw.Transfer.initiate(details);

    // Check for success
    if (response.status === "success") {
      res.status(200).json({
        message: "Transfer Queued Successfully",
        transferDetails: response.data,
      });
    } else {
      res
        .status(400)
        .json({ message: "Transfer Failed", error: response.message });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  receiptUploader,
  getAllReceipt,
  getReceiptById,
  updateUserWallet,
  AddMoneyTo,
  TransferMoneyToGroup,
  Get__user__Transaction__History,
  Get__group__Transaction__History,
  GroupPaysForAProduct,
  GetUserMoney,
  UpdateUserWalletwithReceipt,
  fluterwave_fun_money,
  ProductOrderpaymentForpersonalProductfluterwave_fun_money,
  fluterwave_webhook,
  RiwandaDisbusmentMobileMoney,
};
