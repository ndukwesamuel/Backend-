const { handleErrors } = require("../Middleware/errorHandler/function");
const Category = require("../Models/Category");
const Product = require("../Models/Products");

const getAllCategories = async (req, res) => {
  try {
    categories = await Category.find().sort({ createdAt: -1 });
    if (categories.length < 1) {
      res.status(200).json({ message: "No category created yet" });
    } else {
      res.status(200).json(categories);
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

const getCategory = async (req, res) => {
  try {
    category = await Category.find({ _id: req.params.id });
    if (category.length < 1) {
      res.status(200).json({ message: "Category empty" });
    } else {
      res.status(200).json(category);
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
  try {
    productsInCategory = await Product.find({
      category: req.params.name,
    }).sort({ createdAt: -1 });
    if (productsInCategory.length < 1) {
      res.status(200).json({
        error: true,
        message: "No product available in this category",
      });
    } else {
      res.status(200).json(productsInCategory);
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ error: true, message: errors });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (deletedCategory) {
      res.status(200).json({ message: "category successfully deleted" });
    } else {
      res.status(404).json({ message: "category not found" });
    }
  } catch (err) {
    const errors = handleErrors(err);
    res
      .status(500)
      .json({ error: errors, message: "Category deletion failed" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
    };
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
      }
    );
    if (updatedCategory) {
      res.status(200).json({ message: "Category successfully updated" });
    } else {
      res.status(404).json({ error: true, message: "Category not found" });
    }
  } catch (err) {
    const error = handleErrors(err);
    console.log(err);
    res.status(500).json({ error: true, message: error });
  }
};
module.exports = {
  createCategory,
  getCategory,
  getAllCategories,
  getProductByCategory,
  updateCategory,
  deleteCategory,
};
