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
        // type: String,
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },

      ///this has to  removed
      price: {
        type: Number,
        default: 0,
      },
      name: {
        type: String,
      },

      // all this
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
