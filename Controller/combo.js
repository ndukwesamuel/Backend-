const User = require("../Models/Users");
const AdminProfile = require("../Models/AdminProfile");
const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../Middleware/asyncWrapper");
const Combo = require("../Models/combo");
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
      data: { userProfile, combos },
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
};
