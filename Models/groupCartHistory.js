const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const groupCartHistorySchema = new Schema({
  groupId: {
    type: String,
    ref: "Group",
    required: true,
  },

  productId: {
    type: String,
    ref: "products",
    required: true,
  },
  totalQuantity: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    default: 0,
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
  "groupCartHistory",
  groupCartHistorySchema
);
module.exports = userCartHistory;
