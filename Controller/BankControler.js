const asyncWrapper = require("../Middleware/asyncWrapper");
const foreignBank = require("../Models/foreignBank");
const Group = require("../Models/Group");

const { CreditUser, GroupTransfer } = require("../Models/Transaction");
const { findUserProfileById } = require("../services/userService");

const BeninBank = async (req, res) => {
  const { accountHolder, accountNumber, bankName } = req.body;

  if (!accountHolder || !accountNumber || !bankName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const bank = new foreignBank({ accountHolder, accountNumber, bankName });

  try {
    const newBank = await bank.save();
    res.status(201).json(newBank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const AllBeninBank = async (req, res) => {
  const bank = await foreignBank.find();

  try {
    res.status(201).json(bank);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Get_Bank_USer_Can_Pay_with = asyncWrapper(async (req, res) => {
  const user_id = req.user?.userId;
  const userprofilerespons = await findUserProfileById(user_id);
  const bank = await foreignBank.find();

  let Bank = [
    {
      id: 1,
      BankName: "Access Bank",
      AccountNumber: "044",
      AccountHolder: "John Doe",
      Country: "NGA",
    },
    {
      id: 2,
      BankName: "MoMO",
      AccountNumber: "044",
      AccountHolder: "John Doe",
      Country: "BEN",
    },

    {
      id: 3,
      BankName: "MoMO",
      AccountNumber: "044",
      AccountHolder: "John Doe",
      Country: "GHA",
    },

    {
      id: 3,
      BankName: "MoMO",
      AccountNumber: "044",
      AccountHolder: "John Doe",
      Country: "RWA",
    },
  ];

  let userBank = Bank.filter(
    (b) => b.Country === userprofilerespons?.user?.country
  );

  res.status(201).json({ userBank });
});

module.exports = {
  BeninBank,
  AllBeninBank,
  Get_Bank_USer_Can_Pay_with,
};
