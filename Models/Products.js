const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
  },
  frenchName: {
    type: String,
  },
  image: {
    type: String,
  },
  price: {
    type: Number,
    default: 0,
  },

  otherprice: {
    type: Number,
    default: 0,
  },
  Frenchdescription: {
    type: String,
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
