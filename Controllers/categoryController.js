const Category = require("../Models/Category");
const cloudinary = require("../utils/Cloudinary");
const {
  handleErrors,
  getImageId,
} = require("../Middleware/errorHandler/function");

const createCategory = async (req, res) => {
  try {
    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "webuyam",
    });
    const newCategory = new Category({
      name: req.body.name,
      image: upload.secure_url,
    });
    await newCategory.save();
    res.status(200).json({ message: "Category created" });
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ error: true, message: error });
  }
};

const getCategory = async (req, res) => {
  try {
    category = await Category.find({ name: req.params.name });
    if (category.length < 1) {
      res.status(200).json({ message: "Category empty" });
    } else {
      res.status(200).json(category);
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

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

const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    const imageURL = deletedCategory.image;
    const imageId = getImageId(imageURL);
    if (deletedCategory) {
      await cloudinary.uploader.destroy(`webuyam/${imageId}`);
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
    const currentCategory = await Category.findById(req.params.id);
    const imageId = getImageId(currentCategory.image);
    await cloudinary.uploader.destroy(`webuyam/${imageId}`);

    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "webuyam",
    });
    const data = {
      name: req.body.name,
      image: upload.secure_url,
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
    res.status(500).json({ error: true, message: error });
  }
};

module.exports = {
  getCategory,
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
};
