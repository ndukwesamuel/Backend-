const {
  handleErrors,
  getImageId,
} = require("../Middleware/errorHandler/function");

const Category = require("../Models/Category");
const Product = require("../Models/Products");
const { findUserProfileById } = require("../services/userService");
const cloudinary = require("../utils/Cloudinary");
const appImages = require("../Models/appImages");
const { uploadUserImage } = require("../services/uploadService");
const slug = require("slugify");
const mongoose = require("mongoose");
const createProduct = async (req, res) => {
  // const categoryCheck = await Category.findOne({ name: req.body.category });
  // if (!categoryCheck) {
  //   return res.status(400).json({ error: true, message: "Invalid category" });
  // }

  try {
    const file = req.files.image;

    // Upload file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "webuyam/product",
    });
    const newProduct = new Product({
      name: req.body.name,
      OtherName: req.body.OtherName,
      country: req.body.country,
      price: req.body.price,
      image: uploadResult.secure_url,
      description: req.body.description,
      // category: req.body.category,
      slug: slug(req.body.name, { lower: true }),
    });
    savedProduct = await newProduct.save();
    res.status(200).json({
      message: "Product saved",
      product: savedProduct,
    });
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ error: true, message: error });
  }
};

const getProduct = async (req, res) => {
  try {
    const identifier = req.params.id;

    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

    const product = await Product.findOne(
      isObjectId ? { _id: identifier } : { slug: identifier }
    );
    if (!product) {
      res.status(200).json({ message: "Out of stock" });
    } else {
      res.status(200).send(product);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

// TODO
// Use this country when there are users from other countries

// const getAllProducts = async (req, res) => {
//   const user_id = req.user?.userId;

//   const user_info = await findUserProfileById(user_id);

//   try {
//     const products = await Product.find({
//       country: user_info?.user?.country,
//     }).sort({ createdAt: -1 });

//     if (products.length < 1) {
//       return res.status(200).json({ products: [] });
//     }
//     res.status(200).json(products);
//   } catch (err) {
//     const errors = handleErrors(err);
//     res.status(500).json({ error: errors, message: err });
//   }
// };
const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (products.length < 1) {
      return res.status(200).json({
        products: [],
        pagination: {
          totalProducts: 0,
          totalPages: 0,
          currentPage: page,
          limit,
        },
      });
    }
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ error: errors, message: err });
  }
};

const AdmingetAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();

    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (products.length < 1) {
      return res.status(200).json({
        data: [],
        pagination: {
          totalProducts: 0,
          totalPages: 0,
          currentPage: page,
          limit,
        },
      });
    }
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      data: products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ error: errors, message: err });
  }
};

const OldupdateProduct = async (req, res) => {
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

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if there is a new image in the request
    if (req.files && req.files.image) {
      const file = req.files.image;

      // Upload new image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "webuyam/product",
      });

      // Update image URL
      req.body.image = uploadResult.secure_url;
    }
    const data = { ...req.body, slug: slug(req.body.name, { lower: true }) };
    const updatedProduct = await Product.findByIdAndUpdate(id, data, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation runs for updates
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: err.message,
    });
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

const createAppImage = async (req, res) => {
  try {
    console.log({
      reqBody: req.files,
    });

    const profileImage = await uploadUserImage(req.files.image.tempFilePath);

    const newImage = new appImages({
      infoname: req.body.infoname,
      description: req.body.description,
      image: profileImage,
    });
    const savedImage = await newImage.save();
    res.status(201).json({ savedImage });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllAppImages = async (req, res) => {
  try {
    const images = await appImages.find();
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAppImage = async (req, res) => {
  try {
    const { id } = req.query;
    // const updatedImage = await appImages.findByIdAndUpdate(
    //   req.params.id,
    //   req.body,
    //   {
    //     new: true,
    //   }
    // );
    // if (!updatedImage) {
    //   return res.status(404).json({ message: "Image not found" });
    // }
    res.json(id);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAppImage = async (req, res) => {
  try {
    const deletedImage = await appImages.findByIdAndDelete(req.params.id);
    if (!deletedImage) {
      return res.status(404).json({ message: "Image not found" });
    }
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  AdmingetAllProducts,
  createAppImage,
  getAllAppImages,
  updateAppImage,
  deleteAppImage,
};
