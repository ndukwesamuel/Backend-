const foreignBank = require("../Models/foreignBank");
const Group = require("../Models/Group");

const { CreditUser, GroupTransfer } = require("../Models/Transaction");

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

module.exports = {
  BeninBank,
  AllBeninBank,
};
