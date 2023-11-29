const mongoose = require("mongoose");

const creditSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // Reference to the user making the credit
    amount: { type: Number, required: true },
    description: String,
  },
  { timestamps: true }
);

const CreditUser = mongoose.model("Credit", creditSchema);

const groupTransferSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    }, // Reference to the user sending money
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    }, // Reference to the group receiving the money
    amount: { type: Number, required: true },
    description: String,
  },

  { timestamps: true }
);

const GroupTransfer = mongoose.model("GroupTransfer", groupTransferSchema);

const groupPurchaseSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true }, // Reference to the group making the purchase
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // Reference to the user making the purchase on behalf of the group
  description: String,
  purchaseDate: { type: Date, default: Date.now },
});

const GroupPurchase = mongoose.model("GroupPurchase", groupPurchaseSchema);

module.exports = {
  CreditUser,
  GroupTransfer,
  GroupPurchase,
};
