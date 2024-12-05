const User = require("../Models/Users");
const AdminProfile = require("../Models/AdminProfile");
const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../Middleware/asyncWrapper");
const Combo = require("../Models/combo");
const mongoose = require("mongoose");

const ComboOrder = require("../Models/comboOrder");
const { findUserProfileById } = require("../services/userService");

// Function to create an admin user

// const createCombo = asyncWrapper(async (req, res, next) => {
//   try {
//     const { name, description, products, timeline, country } = req.body;

//     const updatedProducts = products.map((product) => ({
//       ...product,
//       availableQuantity: product.totalQuantity,
//     }));

//     // Create new combo with provided data
//     const combo = new Combo({
//       name,
//       description,
//       products: updatedProducts,
//       timeline,
//       country,
//     });
//     await combo.save();

//     res
//       .status(StatusCodes.OK)
//       .json({ message: "Combo created successfully", combo });
//   } catch (e) {
//     return res.status(404).json({
//       success: false,
//       message: `"Failed to create combo, ${e}`,
//     });
//   }
// });

const createCombo = asyncWrapper(async (req, res, next) => {
  try {
    const {
      name,
      description,
      pickupPoint,
      products,
      timeline,
      country,
      image,
    } = req.body;

    // Validate and prepare products
    const updatedProducts = products.map((product) => ({
      name: product.name,
      price: product.price,
      totalQuantity: product.totalQuantity,
      availableQuantity: product.totalQuantity, // Set availableQuantity to totalQuantity initially
      image: product.image, // Optional product image
    }));

    // Create a new combo using the Combo schema
    const combo = new Combo({
      name,
      description,
      products: updatedProducts, // Add validated products
      timeline,
      country,
      image, // Combo image
      pickupPoint,
    });

    // Save the combo to the database
    await combo.save();

    // Respond with success message and combo details
    res
      .status(StatusCodes.CREATED)
      .json({ success: true, message: "Combo created successfully", combo });
  } catch (e) {
    // Handle errors and respond with a failure message
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: `Failed to create combo: ${e.message}`,
    });
  }
});

const getAllCombo = asyncWrapper(async (req, res, next) => {
  const { active } = req.query;
  const userId = req.user.userId;

  const userProfile = await findUserProfileById(userId);

  let query = { country: userProfile.user.country, isActive: true }; // Default to only active combos

  // Optionally filter by active status if specified
  if (active) {
    query.isActive = active === "true"; // Set based on the active query parameter
  }
  const combos = await Combo.find(query);
  try {
    res.status(StatusCodes.OK).json({
      message: "Combo created successfully",
      data: combos,
    });
  } catch (e) {
    return res.status(404).json({
      success: false,
      message: `"Failed to  combo, ${e}`,
    });
  }
});

const placeComboOrder = asyncWrapper(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.userId;
    const { comboId, selectedProducts } = req.body;

    // Find the user and combo
    const user = await User.findById(userId).session(session);
    const combo = await Combo.findById(comboId).session(session);

    if (!combo) {
      throw new Error("Combo not found");
    }

    let totalPrice = 0;

    // Check if the user already has a pending order for this combo
    let existingOrder = await ComboOrder.findOne({
      user: userId,
      combo: comboId,
      status: "pending", // Only consider pending orders for updating
    }).session(session);

    let updatedOrderItems = existingOrder ? existingOrder.orderItems : [];

    // Iterate through the selected products and validate the quantities
    selectedProducts.forEach((productSelection) => {
      const product = combo.products.find(
        (p) => p._id.toString() === productSelection.productId
      );

      if (!product) {
        throw new Error(
          `Product with ID ${productSelection.productId} not found in this combo`
        );
      }

      if (productSelection.quantity > product.availableQuantity) {
        throw new Error(`Insufficient quantity for ${product.name}`);
      }

      // Find the product in the existing order items (if it exists)
      const existingOrderItem = updatedOrderItems.find(
        (item) => item.productId.toString() === productSelection.productId
      );

      if (existingOrderItem) {
        // Increment the quantity if the product already exists in the order
        existingOrderItem.quantity += productSelection.quantity;
      } else {
        // Add the new product to the order
        updatedOrderItems.push({
          productId: product._id,
          quantity: productSelection.quantity,
        });
      }

      // Deduct the quantity from available stock
      product.availableQuantity -= productSelection.quantity;

      // Calculate the total price for the product
      totalPrice += productSelection.quantity * product.price;
    });

    // Ensure the user has enough funds in the wallet to pay for the order
    if (user.wallet < totalPrice) {
      throw new Error("Insufficient wallet balance to place this order");
    }

    // Deduct the total price from the user's wallet
    user.wallet -= totalPrice;

    // Mark the combo products array as modified so Mongoose will update it
    combo.markModified("products");

    let newOrder; // Declare newOrder before the if-else block

    if (existingOrder) {
      // Update the existing order with new/updated products and total price
      existingOrder.orderItems = updatedOrderItems;
      existingOrder.totalPrice = totalPrice;

      // Save the updated order
      await existingOrder.save({ session });
    } else {
      // Create a new order if no pending order exists
      newOrder = new ComboOrder({
        user: userId,
        combo: comboId,
        orderItems: updatedOrderItems,
        totalPrice: totalPrice,
      });

      // Save the new order
      await newOrder.save({ session });
    }

    // Save the updated combo and user
    await combo.save({ session });
    await user.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    res.json({
      message: "Order placed successfully",
      order: existingOrder || newOrder, // Ensure this refers to either updated or new order
      orderItems: updatedOrderItems,
      combo,
    });
  } catch (error) {
    // If an error occurs, abort the transaction
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return next(error);
  } finally {
    // End the session whether success or failure
    session.endSession();
  }
});

// const getUserOrders = asyncWrapper(async (req, res, next) => {
//   const userId = req.user.userId;
//   const { status } = req.query;

//   const query = { user: userId };

//   if (status) {
//     if (!["pending", "completed", "cancelled"].includes(status)) {
//       return res.status(400).json({ error: "Invalid order status" });
//     }
//     query.status = status;
//   }

//   const orders = await ComboOrder.find(query)
//     .populate("combo", "name products") // Populate combo name and products
//     .populate("orderItems.productId", "name price") // Populate product details
//     .exec();

//   res.json({ orders });
// });

const getUserOrders = asyncWrapper(async (req, res, next) => {
  const userId = req.user.userId;
  const { status } = req.query;

  const query = { user: userId };

  if (status) {
    if (!["pending", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }
    query.status = status;
  }

  const orders = await ComboOrder.find(query)
    .populate({
      path: "combo",
      select: "name products",
      populate: {
        path: "products",
        select: "name price", // Populate products with name and price
      },
    })
    .exec();

  res.json({ orders });
});

const AdmingetAllCombo = asyncWrapper(async (req, res, next) => {
  const { active } = req.query;
  const userId = req.user.userId;

  const combos = await Combo.find();
  try {
    res.status(StatusCodes.OK).json({
      message: "Combo created successfully",
      data: combos,
    });
  } catch (e) {
    return res.status(404).json({
      success: false,
      message: `"Failed to  combo, ${e}`,
    });
  }
});

module.exports = {
  createCombo,
  getAllCombo,
  placeComboOrder,
  getUserOrders,
  AdmingetAllCombo,
};
