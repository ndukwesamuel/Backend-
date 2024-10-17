const mongoose = require("mongoose");

// ComboProduct schema: Each product in the combo
const comboProductSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name of the product
  price: { type: Number, required: true }, // Price per unit of the product
  totalQuantity: { type: Number, required: true }, // Total quantity of the product available in this combo
  availableQuantity: { type: Number, required: true }, // Track the quantity left for selection
});

// Combo schema: The main combo that holds multiple products
const comboSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Combo name
  description: { type: String }, // Optional description for the combo
  products: { type: [comboProductSchema], required: true }, // Array of products in this combo
  timeline: {
    start: { type: Date, required: true }, // Start time of the combo
    end: { type: Date, required: true }, // End time of the combo
  },

  country: {
    type: String,
    required: [true, "Please select your country"],
  },

  isActive: { type: Boolean, default: true }, // Tracks if the combo is still active (true) or expired (false)
  createdAt: { type: Date, default: Date.now }, // When the combo was created
});

// Middleware to set combo as inactive after end date
comboSchema.pre("save", function (next) {
  if (new Date() > this.timeline.end) {
    this.isActive = false; // Set combo as inactive if the end time is reached
  }
  next();
});

const Combo = mongoose.model("Combo", comboSchema);

module.exports = Combo;
