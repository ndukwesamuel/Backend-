const https = require("https");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  handleErrors,
  getImageId,
} = require("../Middleware/errorHandler/function");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../Middleware/Verification");
const { createToken, verifyToken } = require("../Middleware/auth");
const User = require("../Models/Users");
const Group = require("../Models/Group");
const Email = require("../Models/emailVerification");
const userPasswordReset = require("../Models/passwordReset");
const Category = require("../Models/Category");
const Product = require("../Models/Products");
const Cart = require("../Models/Cart");
const paymentVerification = require("../Models/paymentVerification");
const cloudinary = require("../utils/Cloudinary");
const { CreditUser, GroupTransfer } = require("../Models/Transaction");
const upload = require("../Middleware/multer").single("image");

dotenv.config();

const paystackKey = process.env.PAYSTACK_SECRET_KEY;

const AddMoneyTo = async (req, res) => {
  const { userId, amount, description } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
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
  let userId = req.user.id;

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
};

const Get__group__Transaction__History = async (req, res) => {
  let groupId = req.params.groupId;
  let userId = req.user.id;
  const user = await User.findById(userId);

  const group = await Group.findById(groupId);

  let check_member_in_group = group.members.includes(userId);

  console.log({ check_member_in_group });

  if (!check_member_in_group) {
    return res
      .status(404)
      .json({ message: "User is not a member of this group " });
  }

  const grouptransfer = await GroupTransfer.find({ group: group._id });

  console.log({ grouptransfer });

  res.json({ transactionHistory: grouptransfer });
};

const GroupPaysForAProduct = async (req, res) => {
  const { groupId, amount, description, type } = req.body;
  let userId = req.user.id;

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

module.exports = {
  AddMoneyTo,
  TransferMoneyToGroup,
  Get__user__Transaction__History,
  Get__group__Transaction__History,
  GroupPaysForAProduct,
};
