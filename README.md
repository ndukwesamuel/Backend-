# Backend-

Certainly! Below is the modified code that includes the changes discussed:

Updated Cart schema to include the order field.
Modified the verifyPayment function to create an order and remove items from the cart after successful payment verification.
javascript
Copy code
// Cart schema
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
order: {
type: mongoose.Schema.Types.ObjectId,
ref: "order",
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

// Order schema
const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
orderItems: [
{
type: mongoose.Schema.Types.ObjectId,
ref: "orderItem",
required: true,
},
],
shippingAddress1: {
type: String,
required: true,
},
shippingAddress2: {
type: String,
required: true,
},
city: {
type: String,
required: true,
},
zip: {
type: String,
required: true,
},
country: {
type: String,
required: true,
},
phone: {
type: String,
required: true,
},
status: {
type: String,
required: true,
default: "Pending",
},
totalPrice: {
type: Number,
},
user: {
type: mongoose.Schema.Types.ObjectId,
ref: "user",
},
dateOrdered: {
type: Date,
default: Date.now,
},
});

const Order = mongoose.model("order", orderSchema);
module.exports = Order;

// Payment handling code
const { paymentVerification } = require("../Models/paymentVerification");
const { Cart } = require("../Models/cart");
const { Order } = require("../Models/order");

const verifyPayment = async (req, res) => {
// ... (existing code)

respaystack.on("end", async () => {
const response = JSON.parse(data);
if (response.message && response.status === true) {
const amountPaid = response.data.amount / 100;

      const newVerification = new paymentVerification({
        // ... (existing code)
      });
      newVerification.save();

      // Update cart to indicate it has been converted into an order
      const cart = await Cart.findOneAndUpdate(
        { /* specify your cart query, e.g., userId and status */ },
        { order: newVerification._id },
        { new: true }
      );

      // Create an order with cart items
      const newOrder = new Order({
        orderItems: cart.items.map((item) => item.productId),
        shippingAddress1: /* specify your shipping address */,
        // ... (other order details)
        totalPrice: cart.bill,
        user: /* specify the user */,
      });
      await newOrder.save();

      // Remove items from the cart after creating the order
      await Cart.findByIdAndUpdate(
        cart._id,
        { $set: { items: [], bill: 0 } },
        { new: true }
      );
    }
    res.status(200).json(response);

});

// ... (existing code)
};

module.exports = {
verifyPayment,
};
Make sure to adapt this code to fit your specific requirements and data structure.
