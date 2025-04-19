const uploadService = require("../services/uploadService");
const mongoose = require("mongoose");
const Combo = require("../Models/comboModel");
const asyncWrapper = require("../Middleware/asyncWrapper");
const createCombo = asyncWrapper(async (req, res) => {
  const { name, description, country } = req.body;
  let products = [];

  products = req.body.products;
  // Validate products
  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one product must be added to the combo",
    });
  }

  // Handle product images if they exist
  for (let i = 0; i < products.length; i++) {
    const files = Object.fromEntries(
      Object.entries(req.files).map(([k, v]) => [k.trim(), v])
    );
    if (files && files[`productImage_${i}`]) {
      const productImage = await uploadService.uploadComboProductImage(
        files[`productImage_${i}`].tempFilePath
      );
      products[i].image = productImage;
    }
  }

  // Handle main combo image if it exists
  let image = null;
  if (req.files && req.files.image) {
    image = await uploadService.uploadComboProductImage(
      req.files.image.tempFilePath
    );
  }

  const combo = new Combo({
    name,
    description,
    products,
    country,
    image,
  });

  // totalPrice will be calculated via pre-save hook
  await combo.save();

  res.status(201).json({
    success: true,
    message: "Combo created successfully",
    data: combo,
  });
});

module.exports = {
  createCombo,
};
