const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema({
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

const Bankinfo = mongoose.model("Bankinfo", bankSchema);

module.exports = Bankinfo;
