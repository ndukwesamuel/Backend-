const Cart = require("../Models/Cart");
const mongoose = require("mongoose");

const Order = require("../Models/Order");
const OrderItem = require("../Models/OrderItems");
const User = require("../Models/Users");

const userOrder = async (req, res) => {
  try {
    let userId = req.user.userId;
    let { orderStatus } = req.query;

    console.log({
      orderStatus,
    });

    const searchCriteria = {
      user: userId,
    };

    if (orderStatus) {
      searchCriteria.orderStatus = orderStatus;
    }

    const orders = await Order.find(searchCriteria)
      .populate("products.product")
      .populate("user");

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

// const PlaceOrderFromCart = async (req, res) => {
//   try {
//     let userId = req.user.userId;

//     console.log({
//       fff: req.user,
//       yyy: userId,
//     });

//     const cart = await Cart.findOne({ userId }).populate({
//       path: "items.productId",
//       model: "product",
//     });

//     if (!cart || cart.items.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Cart is empty or does not exist." });
//     }

//     const orderDetails = {
//       user: userId,
//       products: cart.items.map((item) => ({
//         product: item.productId._id,
//         quantity: item.quantity,
//       })),
//       totalAmount: cart.bill,
//       // shippingAddress: "req.body.shippingAddress", // You can get this from req.body or user's profile
//     };
//     // Create the order
//     const order = new Order(orderDetails);
//     await order.save();

//     // Clear the cart
//     cart.items = [];
//     cart.bill = 0;
//     await cart.save();

//     res.status(201).json({ message: "Order placed successfully", order });
//   } catch (error) {
//     console.log({
//       error: error,
//     });
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const PlaceOrderFromCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let userId = req.user.userId;

    const cart = await Cart.findOne({ userId })
      .populate({
        path: "items.productId",
        model: "product",
      })
      .session(session); // Ensure the query is run within the transaction

    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ message: "Cart is empty or does not exist." });
    }

    // Fetch user and check wallet balance
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    if (cart.bill > user.wallet) {
      return res.status(400).json({
        message: "Insufficient balance in wallet to complete the transaction",
      });
    }

    // Order details
    const orderDetails = {
      user: userId,
      products: cart.items.map((item) => ({
        product: item.productId._id,
        quantity: item.quantity,
      })),
      totalAmount: cart.bill,
      // shippingAddress: "req.body.shippingAddress", // You can get this from req.body or user's profile
    };

    // Create the order
    const order = new Order(orderDetails);
    await order.save({ session }); // Save within the transaction

    // Deduct the cart bill from the user's wallet
    user.wallet -= cart.bill;
    await user.save({ session }); // Save the updated user wallet balance within the transaction

    // Clear the cart
    cart.items = [];
    cart.bill = 0;
    await cart.save({ session }); // Save the empty cart within the transaction

    await session.commitTransaction(); // Commit the transaction

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    await session.abortTransaction(); // Abort the transaction if an error occurs
    console.log({
      error: error.message,
    });
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    session.endSession();
  }
};

// NOTE: NONE OF THIS ROUTE IS RESTRICTED AND SO I PASSED THE USER ID AS EITHER A BODY OR PARAMS. IF THIS IS WHAT WE WANT, I WILL RESTRICT THEM AND GET THE USER ID FROM req.user.userId

const orderList = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "fullName")
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
        },
      })
      .sort({ dateOrdered: -1 });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders yet", orders: orders });
    }

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      orders: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const orderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "fullName")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
      },
    });

  if (!order || order.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Order can't be found" });
  }
  res.status(200).send(order);
};

const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orderItemsIds = [];

    // Save order items
    for (const orderItem of req.body.orderItems) {
      const newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      const savedOrderItem = await newOrderItem.save();
      orderItemsIds.push(savedOrderItem._id);
    }

    // Calculate total prices
    let totalPrice = 0;
    for (const orderItemId of orderItemsIds) {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      totalPrice += orderItem.product.price * orderItem.quantity;
    }

    // Create and save the order
    const order = new Order({
      orderItems: orderItemsIds,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: userId,
    });

    const savedOrder = await order.save();

    if (!savedOrder) {
      return res.status(400).json({ message: "The order cannot be placed!" });
    }
    await Cart.deleteOne({ userId: userId });
    res.status(201).json({
      message: "Order has been placed",
      order: savedOrder,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error " + error });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );

    if (!order || order.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found!" });
    }

    res.status(200).json({ success: true, message: "Order updated!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error " });
  }
};

const deleteOrder = (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "the order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
};

module.exports = {
  orderList,
  orderById,
  createOrder,
  updateOrder,
  deleteOrder,
  userOrder,
  PlaceOrderFromCart,
};
