const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema({
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
  },
  amount: {
    type: Number,
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
  phone: {
    type: Number,
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
