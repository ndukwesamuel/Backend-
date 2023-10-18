const { handleErrors } = require("../Middleware/errorHandler/function");
const Category = require("../Models/Category");
const Product = require("../Models/Products");

const getAllCategories = async (req, res) => {
  try {
    categories = await Category.find().sort({ createdAt: -1 });
    if (categories.length < 1) {
      res.status(200).json("No category created yet");
    } else {
      res.status(200).json(categories);
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

const createCategory = async (req, res) => {
  try {
    const newCategory = new Category({
      name: req.body.name,
    });
    await newCategory.save();
    res.status(200).json({ message: "Category created" });
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ error: true, message: error });
  }
};

const getProductByCategory = async (req, res) => {
  console.log(req.params.categoryName);

  // try {
  //   productsInCategory = await Product.find({
  //     category:,
  //   }).sort({ createdAt: -1 });
  //   if (productsInCategory.length < 1) {
  //     res.status(200).json({
  //       error: true,
  //       message: "No product available in this category",
  //     });
  //   } else {
  //     res.status(200).json(productsInCategory);
  //   }
  // } catch (err) {
  //   const errors = handleErrors(err);
  //   res.status(500).json({ error: true, message: errors });
  // }
};

module.exports = {
  createCategory,
  getAllCategories,
  getProductByCategory,
};
