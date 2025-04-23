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

const getAllCombos = asyncWrapper(async (req, res) => {
  const {
    country,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 10,
    search,
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const filter = {};

  // Apply search if provided (search in name and description)
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Apply other filters if provided
  if (country) filter.country = country;
  if (minPrice || maxPrice) {
    filter.totalPrice = {};
    if (minPrice) filter.totalPrice.$gte = Number(minPrice);
    if (maxPrice) filter.totalPrice.$lte = Number(maxPrice);
  }

  let sortOptions = {};
  if (sort) {
    const sortFields = sort.split(",");
    sortFields.forEach((field) => {
      // Check if field should be sorted in descending order
      if (field.startsWith("-")) {
        sortOptions[field.substring(1)] = -1;
      } else {
        sortOptions[field] = 1;
      }
    });
  } else {
    // Default sort by creation date, newest first
    sortOptions = { createdAt: -1 };
  }

  const skip = (pageNum - 1) * limitNum;

  const totalCombos = await Combo.countDocuments(filter);

  const combos = await Combo.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    success: true,
    count: combos.length,
    totalPages: Math.ceil(totalCombos / limitNum),
    currentPage: pageNum,
    totalItems: totalCombos,
    data: combos,
  });
});

const getComboById = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid combo ID format",
    });
  }

  const combo = await Combo.findById(id);

  if (!combo) {
    return res.status(404).json({
      success: false,
      message: "Combo not found",
    });
  }

  res.status(200).json({
    success: true,
    data: combo,
  });
});

const updateCombo = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid combo ID format",
    });
  }

  const combo = await Combo.findById(id);

  if (!combo) {
    return res.status(404).json({
      success: false,
      message: "Combo not found",
    });
  }

  const { name, description, country, products } = req.body;

  if (name) combo.name = name;
  if (description) combo.description = description;
  if (country) combo.country = country;

  if (products && Array.isArray(products) && products.length > 0) {
    // Extract current product images before updating
    const oldProductImages = combo.products
      .map((product) => product.image)
      .filter(Boolean);
    combo.products = products;

    for (let i = 0; i < products.length; i++) {
      const files = Object.fromEntries(
        Object.entries(req.files || {}).map(([k, v]) => [k.trim(), v])
      );

      if (files && files[`productImage_${i}`]) {
        const productImage = await uploadService.uploadComboProductImage(
          files[`productImage_${i}`].tempFilePath
        );
        combo.products[i].image = productImage;
      }
    }

    // Get new product images after update
    const newProductImages = combo.products
      .map((product) => product.image)
      .filter(Boolean);

    // Delete old product images that are no longer used
    for (const oldImage of oldProductImages) {
      if (!newProductImages.includes(oldImage)) {
        const publicId = uploadService.extractPublicIdFromUrl(oldImage);
        if (publicId) {
          await uploadService.deleteImage(publicId);
        }
      }
    }
  }

  // Update main combo image if provided
  if (req.files && req.files.image) {
    if (combo.image) {
      const publicId = uploadService.extractPublicIdFromUrl(combo.image);
      if (publicId) {
        await uploadService.deleteImage(publicId);
      }
    }

    combo.image = await uploadService.uploadComboProductImage(
      req.files.image.tempFilePath
    );
  }

  await combo.save();

  res.status(200).json({
    success: true,
    message: "Combo updated successfully",
    data: combo,
  });
});
const deleteCombo = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid combo ID format",
    });
  }

  const combo = await Combo.findById(id);

  if (!combo) {
    return res.status(404).json({
      success: false,
      message: "Combo not found",
    });
  }

  // Delete main combo image from Cloudinary if it exists
  if (combo.image) {
    // Extract public_id from the Cloudinary URL or stored value
    const publicId = await uploadService.extractPublicIdFromUrl(combo.image);
    if (publicId) {
      await uploadService.deleteImage(publicId);
    }
  }

  // Delete all product images from Cloudinary
  if (combo.products && combo.products.length > 0) {
    for (const product of combo.products) {
      if (product.image) {
        const publicId = uploadService.extractPublicIdFromUrl(product.image);
        if (publicId) {
          await uploadService.deleteImage(publicId);
        }
      }
    }
  }

  // Delete the combo from database
  await Combo.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Combo deleted successfully",
  });
});
module.exports = {
  createCombo,
  getAllCombos,
  getComboById,
  updateCombo,
  deleteCombo,
};
