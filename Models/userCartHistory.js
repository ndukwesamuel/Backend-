const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userCartHistorySchema = new Schema({
  userId: {
    type: String,
    ref: "user",
    required: true,
  },

  productId: {
    type: String,
    ref: "product",
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    default: 0,
  },
  name: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const userCartHistory = mongoose.model(
  "userCartHistory",
  userCartHistorySchema
);
module.exports = userCartHistory;
