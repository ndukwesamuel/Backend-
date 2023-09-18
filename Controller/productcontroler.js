const https = require("https");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
  handleErrors,
  getImageId,
} = require("../Middleware/errorHandler/function");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../Middleware/Verification");
const { createToken, verifyToken } = require("../Middleware/auth");
const User = require("../Models/Users");
const Group = require("../Models/Group");
const Email = require("../Models/emailVerification");
const userPasswordReset = require("../Models/passwordReset");
const Category = require("../Models/Category");
const Product = require("../Models/Products");
const Cart = require("../Models/Cart");
const paymentVerification = require("../Models/paymentVerification");
const cloudinary = require("../utils/Cloudinary");
const upload = require("../Middleware/multer").single("image");

dotenv.config();

const paystackKey = process.env.PAYSTACK_SECRET_KEY;

const createProduct = async (req, res) => {
  console.log(req.body);
  //   const categoryCheck = await Category.findOne({ name: req.body.category });
  //   if (!categoryCheck) {
  //     return res.status(400).json({ error: true, message: "Invalid category" });
  //   }
  //   try {
  //     const upload = await cloudinary.uploader.upload(req.file.path, {
  //       folder: "webuyam",
  //     });
  //     const newProduct = new Product({
  //       name: req.body.name,
  //       price: req.body.price,
  //       image: upload.secure_url,
  //       description: req.body.description,
  //       category: req.body.category,
  //     });
  //     savedProduct = await newProduct.save();
  //     res.status(200).json({
  //       message: "Product saved",
  //     });
  //   } catch (err) {
  //     const error = handleErrors(err);
  //     res.status(500).json({ error: true, message: error });
  //   }
};

const getProduct = async (req, res) => {
  try {
    product = await Product.find({ _id: req.params.id });
    if (product.length < 1) {
      res.status(200).json({ message: "Out of stock" });
    } else {
      res.status(200).send(product);
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ error: errors, message: err });
  }
};

const getAllProducts = async (req, res) => {
  try {
    products = await Product.find().sort({ createdAt: -1 });
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

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
};
