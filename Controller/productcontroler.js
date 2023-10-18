const {
  handleErrors,
  getImageId,
} = require("../Middleware/errorHandler/function");

const Category = require("../Models/Category");
const Product = require("../Models/Products");
const cloudinary = require("../utils/Cloudinary");

const createProduct = async (req, res) => {
  const categoryCheck = await Category.findOne({ name: req.body.category });
  if (!categoryCheck) {
    return res.status(400).json({ error: true, message: "Invalid category" });
  }
  try {
    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "webuyam/product",
    });
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      image: upload.secure_url,
      description: req.body.description,
      category: req.body.category,
    });
    savedProduct = await newProduct.save();
    res.status(200).json({
      message: "Product saved",
      product: savedProduct,
    });
  } catch (err) {
    const error = handleErrors(err);
    console.log(err);
    res.status(500).json({ error: true, message: error });
  }
};

const getProduct = async (req, res) => {
  try {
    let product = await Product.find({ _id: req.params.id });
    if (product.length < 1) {
      res.status(200).json({ message: "Out of stock" });
    } else {
      res.status(200).send(product);
    }
  } catch (err) {
    // const errors = handleErrors(err);
    res.status(500).json({ error: err });
  }
};

const getAllProducts = async (req, res) => {
  try {
    let products = await Product.find().sort({ createdAt: -1 });
    if (products.length < 1) {
      res.status(200).json({ message: "No product created yet" });
    } else {
      res.status(200).json(products);
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ error: errors, message: err });
  }
};

const updateProduct = async (req, res) => {
  try {
    const currentProduct = await Product.findById(req.params.id);
    const imageId = getImageId(currentProduct.image);
    await cloudinary.uploader.destroy(`webuyam/product/${imageId}`);

    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "webuyam/product",
    });
    const data = {
      name: req.body.name,
      price: req.body.price,
      image: upload.secure_url,
      description: req.body.description,
      category: req.body.category,
    };
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );
    if (updatedProduct) {
      res.status(200).json({ message: "Product successfully updated" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    // const errors = handleErrors(err);
    console.log(err);
    res.status(500).json({ error: err, message: "Product update failed" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    const imageURL = deletedProduct.image;
    const imageId = getImageId(imageURL);
    if (deletedProduct) {
      await cloudinary.uploader.destroy(`webuyam/product/${imageId}`);
      res.status(200).json({ message: "Product successfully deleted" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ error: errors, message: "Product deletion failed" });
  }
};
module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
};