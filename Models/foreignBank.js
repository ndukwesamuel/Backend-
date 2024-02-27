const mongoose = require("mongoose");

const foreignBankSchema = new mongoose.Schema({
  accountHolder: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
  },
  bankName: {
    type: String,
    required: true,
  },
});

const foreignBank = mongoose.model("foreignBank", foreignBankSchema);
module.exports = foreignBank;
