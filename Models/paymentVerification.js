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
  userId: {
    type: String,
    ref: "Users",
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
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  zip_code: {
    type: Number,
  },
  address: {
    type: String,
  },
  reference: {
    type: String,
  },
  order: [
    {
      product: [
        {
          name: {
            type: String,
          },
          image: {
            type: String,
          },
          price: {
            type: Number,
            default: 0,
          },
          description: {
            type: String,
          },
          brand: {
            type: String,
          },
          quantity: {
            type: String,
          },
        },
      ],
      subTotal: {
        type: Number,
        default: 0,
      },
    },
  ],
  created_at: {
    type: String,
  },
});
const paymentVerification = mongoose.model(
  "paymentVerification",
  verificationSchema
);
module.exports = paymentVerification;
