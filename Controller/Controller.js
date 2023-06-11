const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { handleErrors } = require("../Middleware/errorHandler/function");
const {
  sendVerificationEmail,
  sendResetEmail,
} = require("../Middleware/Verification");
const { createToken, verifyToken } = require("../Middleware/auth");
const User = require("../Models/Users");
const Group = require("../Models/Group");
const Email = require("../Models/emailVerification");

const getData = async (req, res) => {
  let data = [
    { name: "tunde", id: 1 },
    { name: "emeka", id: 2 },
    { name: "kaka", id: 3 },
    { name: "peter", id: 4 },

    { name: "kaka", id: 3 },
    { name: "peter", id: 4 },
    { name: "kaka", id: 3 },
    { name: "peter", id: 4 },
    { name: "kaka", id: 3 },
    { name: "peter", id: 4 },
    { name: "kaka", id: 3 },
    { name: "peter", id: 4 },
    { name: "kaka", id: 3 },
    { name: "peter", id: 4 },
  ];

  res.status(200).json(data);
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = new User({
    fullName: name,
    email: email,
    password: password,
  });

  try {
    savedUser = await newUser.save();
    sendVerificationEmail(savedUser, res);
    // res.status(201).json({ savedUser });
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ message: error });
  }
};

const login = async (req, res) => {
  const { password, email } = req.body;
  try {
    const user = await User.login(email, password);
    if (user.verified) {
      const token = createToken(user._id);

      const { password, ...others } = user._doc;
      res.status(200).json({ ...others, token });
    } else {
      res.status(401).json({ message: "Verify email to login" });
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({ error });
  }
};

const emailVerification = async (req, res) => {
  const { userId, uniqueNumber } = req.body;

  try {
    userData = await Email.findOne({ userId }).sort({ createdAt: -1 });

    if (userData) {
      const expireAt = userData.expireAt;

      const hashedUniqueNumber = userData.uniqueNumber;

      // checking if the uniqueNumber has expired
      if (expireAt < Date.now()) {
        Email.deleteOne({ userId })
          .then((result) => {
            User.deleteOne({ _id: userId }).then(() => {
              res.status(200).json({ message: "link expired, signup again" });
            });
          })
          .catch((err) => {
            res.status(500).json("error occurred while deleting this user");
          });
      } else {
        // if unique string hasn't expire
        // compare the unique number with the one in the database

        bcrypt
          .compare(uniqueNumber, hashedUniqueNumber)
          .then((result) => {
            if (result) {
              User.updateOne({ _id: userId }, { verified: true })
                .then(() => {
                  Email.deleteOne({ userId })
                    .then(() => {
                      res.status(200).json({ message: "Email verified" });
                    })
                    .catch((err) => {
                      console.log(err);

                      res
                        .status(500)
                        .json("email Verification data not deleted");
                    });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({ message: "update error" });
                });
            }
          })
          .catch((err) => {
            console.log(err);

            res.status(500).json({ message: "unique number not valid" });
          });
      }
    } else {
      res.json({
        error: true,
        message: "Email has been verified already!",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({ message: "Email has been verified already" });
  }
};

const resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    userData = await User.findOne({ email: email });
    if (userData === null) {
      res.status(500).json({ error: true, Message: "Email not registered" });
    } else {
      sendVerificationEmail(userData, res);
    }
  } catch (error) {
    res.status(500).json({ error: true, Message: "Email not registered" });
  }
};

// Requesting for password reset email
const passwordResetEmail = async (req, res) => {
  const { email } = req.body;
  try {
    userData = await User.findOne({ email });
    if (userData) {
      // Check if the user has been verified before sending password reset email
      if (userData.verified) {
        sendResetEmail(userData, res);
      } else {
        res.status(401).json({ message: "Email has not been verified" });
      }
    } else {
      res.status(404).json({ message: "Email not registered" });
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

// const passwordReset = async (req, res) => {
//   const { uniqueNumber, userId } = req.body;
// };

const group = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findOne({ _id: userId });
    if (user) {
      const isUserAdmin = await Group.findOne({ userAdminId: userId });
      if (isUserAdmin) {
        res.status(200).json({ message: "You created a group already" });
      } else {
        const groupCreated = await Group.create({ name, userAdminId: userId });

        if (groupCreated) {
          User.updateOne({ _id: userId }, { isUserAdmin: true })
            .then((data) => {})
            .catch((error) => {});
          res.status(200).json({ message: "Group created" });
        } else {
          res.status(500).json({ error: true, message: "Group not created" });
        }
      }
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ message: error });
  }
};

const joinGroup = async (req, res) => {
  const userId = req.user.id;
  try {
    const groupName = await Group.findOne({ name: req.params.groupName });
    const isUserAdmin = await Group.findOne({ userAdminId: userId });
    if (!isUserAdmin) {
      await Group.create({ member: userId });
      res.status(200).json({ message: "done" });
    } else {
      res.status(404).json({ message: "You already joined this group" });
    }
  } catch (err) {
    const error = handleErrors({ message: err });
  }
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    if (groups.length < 1) {
      res.status(200).json({ message: "No group created yet" });
    } else {
      res.status(200).json({ message: groups });
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ message: error });
  }
};

const createCategory = async (req, res) => {
  try {
    await Category.create(req.body);
    res.status(200).json({ message: "Category created" });
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ error: true, message: error });
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
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      image: req.body.image,
    });
    if (updatedCategory) {
      res.status(200).json({ message: "category successfully updated" });
    } else {
      res
        .status(404)
        .json({ error: true, message: "category to be updated not found" });
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ error: true, message: error });
  }
};

// GET cart for a user
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Login to view your cart items" });
  }
};

// ADD item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, price, name } = req.body;
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      // create a new cart if one doesn't exist for the user
      const newCart = new Cart({
        userId: req.params.userId,
        items: [{ productId, quantity, price, name }],
      });
      await newCart.save();
      res.status(200).json(newCart);
    } else {
      // add the item to the existing cart
      const index = cart.items.findIndex((item) => item.productId == productId);
      if (index === -1) {
        // add the item if it doesn't already exist in the cart
        cart.items.push({ productId, quantity, price, name });
      } else {
        // update the quantity of the item if it already exists in the cart
        cart.items[index].quantity += 1;
      }
      await cart.save();
      res.status(200).json(cart);
    }
  } catch (err) {
    res.status(404).json({ message: "User not found" });
  }
};
// Decrease items quantity
const decreaseCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const index = cart.items.findIndex(
      (item) => item.productId == req.params.productId
    );
    if (index === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    } else {
      if (cart.items[index].quantity > 1) {
        cart.items[index].quantity -= 1;
        await cart.save();
        res.status(200).json(cart);
      } else {
        cart.items.splice(index, 1);
        await cart.save();
        res.status(200).json(cart);
      }
    }
  } catch (err) {
    res.status(404).json({ message: "User not found" });
  }
};
// REMOVE item from cart
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const index = cart.items.findIndex(
      (item) => item.productId == req.params.productId
    );
    if (index === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    cart.items.splice(index, 1);
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(404).json({ message: "User not found" });
  }
};

const createProduct = async (req, res) => {
  const categoryCheck = await Category.findOne({ name: req.body.category });
  if (!categoryCheck) {
    return res.status(400).json({ error: true, message: "Invalid category" });
  }
  // if (!req.file) {
  //   return res.status(400).json({
  //     error: "Insert image",
  //   });
  // }
  // const fileName = req.file.filename;
  // const imagePath = `${req.protocol}://${req.get("host")}/image/uploads/`;
  const newProduct = new Product({
    name: req.body.name,
    price: req.body.price,
    // image: `${imagePath}${fileName}`,
    description: req.body.description,
    category: req.body.category,
  });
  try {
    savedProduct = await newProduct.save();
    res.status(200).json({ message: "Product saved" });
  } catch (err) {
    const error = handleErrors(err);
    console.log(err);
    res.status(500).json({ error: true, message: error });
  }
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
      res.status(200).json("No product created yet");
    } else {
      res.status(200).json(products);
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ error: errors, message: err });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (deletedProduct) {
      res.status(200).json({ message: "Product successfully deleted" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ error: errors, message: "Product deletion failed" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    if (updatedProduct) {
      res.status(200).json({ message: "Product successfully updated" });
    } else {
      res.status(404).json({ message: "Product to be updated not found" });
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(500).json({ error: errors, message: "Product update failed" });
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
//  for testing the verifyToken middleware
const home = async (req, res) => {
  res.send("this is the home");
};
module.exports = {
  getData,
  register,
  login,
  group,
  emailVerification,
  home,
  resendOTP,
  getAllGroups,
  joinGroup,
  passwordResetEmail,
  getCategory,
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  addToCart,
  getCart,
  removeFromCart,
  decreaseCartItems,
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProduct,
  getProductByCategory,
};
