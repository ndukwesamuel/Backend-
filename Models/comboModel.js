const mongoose = require("mongoose");

const newComboProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
  },
});
const newComboSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  products: {
    type: [newComboProductSchema],
    required: true,
    validate: {
      validator: function (products) {
        return products && products.length > 0;
      },
      message: "At least one product must be added to the combo",
    },
  },
  totalPrice: {
    type: Number,
    default: 0,
  },
  country: {
    type: String,
    required: [true, "Please select your country"],
  },
  image: {
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
newComboSchema.pre("save", function (next) {
  this.totalPrice = this.products.reduce((total, product) => {
    return total + product.price * product.quantity;
  }, 0);

  this.updatedAt = Date.now();
  next();
});

// Create a method to recalculate totalPrice (useful for updates)
newComboSchema.methods.calculateTotalPrice = function () {
  this.totalPrice = this.products.reduce((total, product) => {
    return total + product.price * product.quantity;
  }, 0);
  return this.totalPrice;
};

const Combo = mongoose.model("newCombo", newComboSchema);

module.exports = Combo;
