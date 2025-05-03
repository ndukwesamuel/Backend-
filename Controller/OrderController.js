const Cart = require("../Models/Cart");
const mongoose = require("mongoose");
const Order = require("../Models/Order");
const OrderItem = require("../Models/OrderItems");
const User = require("../Models/Users");
const Product = require("../Models/Products");
const { generateOrderId } = require("../utils/codeGenerator");
// FOr mobile app
const userOrder = async (req, res) => {
  try {
    let userId = req.user.userId;
    let { orderStatus } = req.query;

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

const userOrderList = async (req, res) => {
  try {
    const { userId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalProducts = await Order.countDocuments({ user: userId });

    const orders = await Order.find({ user: userId })
      .populate({ path: "products", populate: "product" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders yet", data: [] });
    }
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

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
  const session = await mongoose.startSession();
  session.startTransaction();
  const orderId = await generateOrderId();
  const deliveryDate = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours from now

  try {
    const userId = req.user.userId;
    const { selectedCartItems, deliveryFee, shippingDetails, paymentMethod } =
      req.body;
    const { fullName, phoneNumber, street, area, additionalInfo } =
      shippingDetails;

    const cartItems = selectedCartItems.map((item) => ({
      id: item.productId._id,
      quantity: item.quantity,
    }));

    // Calculate total
    let totalPrice = parseInt(deliveryFee);
    for (const item of cartItems) {
      const product = await Product.findById(item.id).session(session);
      if (!product) throw new Error(`Product with ID ${item.id} not found`);
      totalPrice += product.price * item.quantity;
    }

    let paid = false;

    if (paymentMethod === "wallet") {
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error("User not found");

      if (totalPrice > user.wallet) {
        return res.status(400).json({
          success: false,
          message: "Insufficient balance in wallet to complete the transaction",
        });
      }

      user.wallet -= totalPrice;
      await user.save({ session });
      paid = true;
    }

    // Create order
    const order = new Order({
      orderId,
      user: userId,
      phone: phoneNumber,
      products: cartItems.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      })),
      totalAmount: totalPrice,
      shippingAddress: {
        fullName,
        address: `${street}, ${area}`,
        additionalInfo,
      },
      paid,
      deliveryDate,
    });

    await order.save({ session });

    // Remove ordered items from cart
    await Cart.updateOne(
      { userId: userId },
      {
        $pull: {
          items: {
            productId: { $in: cartItems.map((item) => item.id) },
          },
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Redirect for BNPL
    if (paymentMethod === "bnpl") {
      return res.status(201).json({
        success: true,
        redirect:
          "https://checkout.credpal.com/?key=171e9536-7b31-46b0-80a4-d8fd9bb79b4b&method=payment_link",
        message: "Order created successfully. Redirecting...",
        data: order,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      success: false,
      message: "Failed to create order: " + error.message,
    });
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
  userOrderList,
  orderList,
  orderById,
  createOrder,
  updateOrder,
  deleteOrder,
  userOrder,
  PlaceOrderFromCart,
};
