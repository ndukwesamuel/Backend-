const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const groupCartHistorySchema = new Schema({
  groupId: {
    type: Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: "product",
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
  status: {
    type: String,
    enum: ["pending", "processing", "completed"],
    default: "pending",
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

const groupCartHistory = mongoose.model(
  "groupCartHistory",
  groupCartHistorySchema
);
module.exports = groupCartHistory;
