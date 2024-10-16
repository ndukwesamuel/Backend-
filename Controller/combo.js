const User = require("../Models/Users");
const AdminProfile = require("../Models/AdminProfile");
const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../Middleware/asyncWrapper");
const Combo = require("../Models/combo");

const ComboOrder = require("../Models/comboOrder");
const { findUserProfileById } = require("../services/userService");

// Function to create an admin user

const createCombo = asyncWrapper(async (req, res, next) => {
  try {
    const { name, description, products, timeline, country } = req.body;

    const updatedProducts = products.map((product) => ({
      ...product,
      availableQuantity: product.totalQuantity,
    }));

    // Create new combo with provided data
    const combo = new Combo({
      name,
      description,
      products: updatedProducts,
      timeline,
      country,
    });
    await combo.save();

    res
      .status(StatusCodes.OK)
      .json({ message: "Combo created successfully", combo });
  } catch (e) {
    return res.status(404).json({
      success: false,
      message: `"Failed to create combo, ${e}`,
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

// const placeComboOrder = async (userId, comboId, selectedProducts) => {
const placeComboOrder = asyncWrapper(async (req, res, next) => {
  const userId = req.user.userId;
  const userProfile = await findUserProfileById(userId);
  const { comboId, selectedProducts } = req.body;
  const combo = await Combo.findById(comboId);
  if (!combo) {
    throw new Error("Combo not found");
  }

  let totalPrice = 0;

  // Iterate through the selected products and validate the quantities
  const orderItems = selectedProducts.map((productSelection) => {
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

    // Deduct the quantity from available stock
    product.availableQuantity -= productSelection.quantity;

    // Calculate total price
    totalPrice += productSelection.quantity * product.price;

    return {
      productId: product._id,
      quantity: productSelection.quantity,
    };
  });

  await combo.save();

  // Create a new order
  const order = new ComboOrder({
    user: userId,
    combo: comboId,
    orderItems: orderItems,
    totalPrice: totalPrice,
  });

  // Save the order
  await order.save();

  res.json({ message: "Order placed successfully", order, orderItems, combo });
});

// try {
//   // Fetch the combo details with products
//   const combo = await Combo.findById(comboId);
//   if (!combo) {
//     throw new Error('Combo not found');
//   }

//   if (!combo.isActive) {
//     throw new Error('This combo is no longer available');
//   }

//   let totalPrice = 0;

//   // Iterate through the selected products and validate the quantities
//   const orderItems = selectedProducts.map((productSelection) => {
//     const product = combo.products.find(
//       (p) => p._id.toString() === productSelection.productId
//     );

//     if (!product) {
//       throw new Error(`Product with ID ${productSelection.productId} not found in this combo`);
//     }

//     if (productSelection.quantity > product.availableQuantity) {
//       throw new Error(`Insufficient quantity for ${product.name}`);
//     }

//     // Deduct the quantity from available stock
//     product.availableQuantity -= productSelection.quantity;

//     // Calculate total price
//     totalPrice += productSelection.quantity * product.price;

//     return {
//       productId: product._id,
//       quantity: productSelection.quantity,
//     };
//   });

//   // Save updated combo product quantities
//   await combo.save();

//   // Create a new order
//   const order = new Order({
//     user: userId,
//     combo: comboId,
//     orderItems: orderItems,
//     totalPrice: totalPrice,
//   });

//   // Save the order
//   await order.save();

//   return { success: true, message: 'Order placed successfully', order };
// } catch (error) {
//   return { success: false, message: error.message };
// }

module.exports = {
  createCombo,
  getAllCombo,
  placeComboOrder,
};
