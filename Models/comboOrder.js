const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true }, // Quantity of the product ordered
});

const comboOrderorderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // The user who placed the order
  combo: { type: Schema.Types.ObjectId, ref: "Combo", required: true }, // The combo being ordered
  orderItems: [orderItemSchema], // List of products in the combo and the selected quantity
  totalPrice: { type: Number, required: true }, // Total price for the combo order
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending", // Status of the order
  },
  createdAt: { type: Date, default: Date.now }, // Order creation time
});

const ComboOrder = mongoose.model("ComboOrder", comboOrderorderSchema);

module.exports = ComboOrder;
