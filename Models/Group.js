const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }], // Array of admin user IDs
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    wallet: {
      type: Number,
      default: 0, // Initial group wallet balance is 0
    },
    cart: [
      {
        userProductInfo: [
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "user",
            },
            quantity: {
              type: Number,
            },
            amount: {
              type: Number,
            },
          },
        ],
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
        },
        totalQuantity: {
          type: Number,
          default: 0,
        },
        totalAmount: {
          type: Number,
          default: 0,
        },
      },
    ],
    bill: {
      type: Number,
      default: 0,
    },
    country: {
      type: String,
      required: [true, "Country cannot be empty"],
    },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
