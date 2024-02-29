const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const receiptSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receipt: {
      type: String, // You can store the image URL or file path here
    },
    amount: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Receipt = mongoose.model("receipt", receiptSchema);

module.exports = Receipt;
