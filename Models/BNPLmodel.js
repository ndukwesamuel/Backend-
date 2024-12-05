const mongoose = require("mongoose");

const LoanHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ["Borrowed", "Repaid"],
    required: true,
  },
});

const LoanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    loanLimit: { type: Number, required: true, default: 50000 }, // Set a default loan limit
    currentLoan: { type: Number, default: 0 }, // Amount currently owed
    remainingBalance: { type: Number, default: 0 }, // Remaining balance of the current loan
    nextRepaymentDate: { type: Date },
    creditworthiness: {
      type: String,
      enum: ["Good", "Average", "Poor"],
      default: "Average",
    },
    loanHistory: [LoanHistorySchema], // Track loan transactions
    isLoanActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Loan = mongoose.model("Loan", LoanSchema);

module.exports = Loan;
