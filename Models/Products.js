const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
  },
  OtherName: {
    type: String,
  },
  country: {
    type: String,
    required: [true, "Please select your country"],
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
  category: {
    type: String,
    ref: "category",
  },
  brand: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const product = mongoose.model("product", productSchema);

module.exports = product;
