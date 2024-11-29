const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Paid"],
      default: "Pending",
    },
    remainingBalance: { type: Number, default: 0 },
    nextRepaymentDate: { type: Date },
    creditworthiness: {
      type: String,
      enum: ["Good", "Average", "Poor"],
      default: "Average",
    },
  },
  { timestamps: true }
);

const Loan = mongoose.model("Loan", LoanSchema);

module.exports = Loan;
