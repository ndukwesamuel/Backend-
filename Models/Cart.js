const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: {
    type: String,
    ref: "user",
    required: true,
  },
  items: [
    {
      productId: {
        type: String,
        ref: "products",
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
    },
  ],
  bill: {
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

const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
