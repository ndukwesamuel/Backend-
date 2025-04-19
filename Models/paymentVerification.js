const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema({
  amount: {
    type: Number,
  },
  userId: {
    type: String,
    ref: "user",
  },
  verification_id: {
    type: Number,
  },
  customer_id: {
    type: Number,
  },
  customer_code: {
    type: String,
  },

  reference: {
    type: String,
  },

  created_at: {
    type: String,
  },
});
const paymentVerification = mongoose.model(
  "paymentVerification",
  verificationSchema
);
module.exports = paymentVerification;
