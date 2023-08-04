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

const logout = async (req, res) => {
  const authHeader = req.headers.token;
  jwt.sign(
    authHeader,
    "",
    {
      expiresIn: 1,
    },
    (logout, err) => {
      if (logout) {
        res.status(200).json({ message: "Logged out" });
      } else {
        res.status(401).json({ message: err });
      }
    }
  );
};

const emailVerification = async (req, res) => {
  const { userId, uniqueString } = req.body;

  try {
    userData = await Email.findOne({ userId }).sort({ createdAt: -1 });
    console.log(userData);
    if (userData) {
      const expireAt = userData.expireAt;

      const hashedUniqueString = userData.uniqueString;

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
          .compare(uniqueString, hashedUniqueString)
          .then((result) => {
            if (result) {
              User.updateOne({ _id: userId }, { verified: true })
                .then(() => {
                  Email.deleteOne({ userId })
                    .then(() => {
                      res.status(200).json({ message: "Email verified" });
                    })
                    .catch((err) => {
                      res
                        .status(500)
                        .json("email Verification data not deleted");
                    });
                })
                .catch((err) => {
                  res.status(500).json({ message: "update error" });
                });
            }
          })
          .catch((err) => {
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

const resendVerificationEmail = async (req, res) => {
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
  const { email, redirectUrl } = req.body;
  try {
    userData = await User.findOne({ email });
    if (userData) {
      // Check if the user has been verified before sending password reset email
      if (userData.verified) {
        sendPasswordResetEmail(userData, redirectUrl, res);
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

const resetPassword = async (req, res) => {
  const { userId, uniqueString, newPassword } = req.body;
  try {
    userData = await userPasswordReset
      .findOne({ userId })
      .sort({ createdAt: -1 });
    if (userData) {
      const expireAt = userData.expireAt;

      const hashedUniqueString = userData.uniqueString;

      // checking if the uniqueString has expired
      if (expireAt < Date.now()) {
        userPasswordReset
          .deleteOne({ userId })
          .then((result) => {
            res.status(200).json({
              error: true,
              message: "link expired, request for new link",
            });
          })
          .catch((err) => {
            res
              .status(500)
              .json("error occurred while deleting this user password reset");
          });
      } else {
        // if unique string hasn't expire
        // compare the unique string with the one in the database
        bcrypt
          .compare(uniqueString, hashedUniqueString)
          .then((result) => {
            if (result) {
              //  Hass the new password
              bcrypt
                .hash(newPassword, 10)
                .then((hashedPassword) => {
                  // Update password
                  User.updateOne(
                    { _id: userId },
                    { password: hashedPassword }
                  ).then(() => {
                    // delete reset data from db
                    userPasswordReset
                      .deleteOne({ userId })
                      .then((response) => {
                        res.json({ message: "password reset successfully" });
                      })
                      .catch((err) => {
                        res.json({ message: "deleting reset data failed" });
                      });
                  });
                })
                .then((result) => {})
                .catch((err) => {
                  res.json({ message: "password not updated" });
                })
                .catch((err) => {
                  res.json({ message: "Error while hashing password" });
                });
            } else {
              res.json({
                error: true,
                message: "Invalid password reset details",
              });
            }
          })
          .catch((err) => {
            res.status(500).json({ message: "unique string not valid" });
          });
      }
    } else
      res
        .status(404)
        .json({ message: "Invalid details: Use the link in your mail!" });
  } catch (err) {
    console.log(err);
    res.status(404).json("Invalid id");
  }
};

const createGroup = async (req, res) => {
  const name = req.body.name.toLowerCase();
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
    const isUserAdmin = await Group.findOne({ userAdminId: userId });
    if (!isUserAdmin) {
      const groups = await Group.find();
      const existingMemebers = [];
      groups.forEach((group) => {
        existingMemebers.push(...group.members);
      });
      const group = await Group.findOne({ name: req.params.groupName });
      if (!group) {
        res.status(404).json({ message: "Group not found" });
      } else if (existingMemebers.includes(userId)) {
        res.json({ message: "You already joined a group" });
      } else {
        group.members.push(userId);
        await group.save();
        res.status(200).json({ message: `Joined ${group.name} group` });
      }
    } else {
      res.status(404).json({ message: "You already created a group" });
    }
  } catch (err) {
    const error = handleErrors({ message: err });
    res.json({ message: error });
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

const deleteGroup = async (req, res) => {
  const userId = req.user.id;
  try {
    const isUserAdmin = await Group.findOne({ userAdminId: userId });
    if (isUserAdmin) {
      await Group.deleteOne({ name: req.params.groupName });
      res.status(200).json({ message: "Group deleted" });
    } else {
      res.status(401).json({ message: "Action not permitted" });
    }
  } catch (error) {
    res.json({ message: error });
  }
};

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

// GET cart for a user
const getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) {
    res.status(404).json({ message: "Cart is empty" });
  } else {
    res.status(200).json(cart);
  }
};

// ADD item to cart
const addToCart = async (req, res) => {
  const { productId, quantity, price, name } = req.body;
  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) {
    // create a new cart if one doesn't exist for the user
    const newCart = new Cart({
      userId: req.user.id,
      items: [{ productId, quantity, price, name }],
      bill: quantity * price,
    });
    await newCart.save();
    res.status(200).json(newCart);
  } else {
    // add the item to the existing cart
    const index = cart.items.findIndex((item) => item.productId == productId);
    if (index === -1) {
      // add the item if it doesn't already exist in the cart
      const initailValue = 0;

      cart.items.push({ productId, quantity, price, name });
      cart.bill = cart.items.reduce((total, curr) => {
        return total + curr.quantity * curr.price;
      }, initailValue);
    } else {
      // update the quantity of the item if it already exists in the cart
      const initailValue = 0;
      cart.items[index].quantity += 1;
      cart.bill = cart.items.reduce((total, curr) => {
        return total + curr.quantity * curr.price;
      }, initailValue);
    }
    await cart.save();
    res.status(200).json(cart);
  }
};
// Decrease items quantity
const decreaseCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    const index = cart.items.findIndex(
      (item) => item.productId == req.body.productId
    );
    if (index === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    } else {
      if (cart.items[index].quantity > 1) {
        cart.items[index].quantity -= 1;
        cart.bill -= cart.items[index].price;
        await cart.save();
        res.status(200).json(cart);
      } else {
        cart.items.splice(index, 1);
        cart.bill = 0;
        await cart.save();
        res.status(200).json(cart);
      }
    }
  } catch (error) {
    res.status(404).json({ message: "Cart is empty" });
  }
};
// REMOVES an item from cart at once
const deleteFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    const index = cart.items.findIndex(
      (item) => item.productId == req.body.productId
    );
    if (index === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    const deletedItemBill =
      cart.items[index].quantity * cart.items[index].price;
    cart.items.splice(index, 1);
    cart.bill -= deletedItemBill;
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(404).json({ message: "Cart is empty" });
  }
};

const createProduct = async (req, res) => {
  const categoryCheck = await Category.findOne({ name: req.body.category });
  if (!categoryCheck) {
    return res.status(400).json({ error: true, message: "Invalid category" });
  }
  try {
    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "webuyam",
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
    });
  } catch (err) {
    const error = handleErrors(err);
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
      res.status(200).json({ message: "No product created yet" });
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
    const imageURL = deletedProduct.image;
    const imageId = getImageId(imageURL);
    if (deletedProduct) {
      await cloudinary.uploader.destroy(`webuyam/${imageId}`);
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
    const currentProduct = await Product.findById(req.params.id);
    const imageId = getImageId(currentProduct.image);
    await cloudinary.uploader.destroy(`webuyam/${imageId}`);

    const upload = await cloudinary.uploader.upload(req.file.path, {
      folder: "webuyam",
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
    res.status(500).json({ error: err, message: "Product update failed" });
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

const payment = async (req, res) => {
  const { email, amount, firstname, lastname, phone } = req.body;
  try {
    const params = JSON.stringify({
      email: `${email}`,
      amount: `${amount * 100}`,
      first_name: firstname,
      last_name: lastname,
      phone: phone,
      metadata: {
        first_name: firstname,
        last_name: lastname,
        phone: phone,
      },

      callback_url: "https://webuy-opal.vercel.app/verify",
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
    };
    // client request to paystack API
    const reqpaystack = https
      .request(options, (reqpaystack) => {
        let data = "";

        reqpaystack.on("data", (chunk) => {
          data += chunk;
        });

        reqpaystack.on("end", () => {
          res.status(200).json(data);
        });
      })
      .on("error", (error) => {
        res.send(error);
      });

    reqpaystack.write(params);
    reqpaystack.end();
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};

const verifyPayment = async (req, res) => {
  const { reference } = req.body;
  const https = require("https");

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${paystackKey}`,
    },
  };

  const reqpaystack = https
    .request(options, (respaystack) => {
      let data = "";

      respaystack.on("data", (chunk) => {
        data += chunk;
      });

      respaystack.on("end", () => {
        const response = JSON.parse(data);
        if (response.message && response.status === true) {
          const amountPaid = response.data.amount / 100;

          const newVerification = new paymentVerification({
            firstname: response.data.metadata.first_name,
            lastname: response.data.metadata.last_name,
            amount: amountPaid,
            email: response.data.customer.email,
            customer_code: response.data.customer.customer_code,
            phone: response.data.metadata.phone,
            customer_id: response.data.customer.id,
            verification_id: response.data.id,
            reference: response.data.reference,
            created_at: response.data.created_at,
          });
          newVerification.save();
        }
        res.status(200).json(response);
      });
    })
    .on("error", (error) => {
      res.send(JSON.parse(error));
    });
  reqpaystack.end();
};
//  for testing the verifyToken middleware
const home = async (req, res) => {
  res.send("this is the home");
};
module.exports = {
  getData,
  register,
  login,
  logout,
  createGroup,
  emailVerification,
  home,
  resendVerificationEmail,
  resetPassword,
  getAllGroups,
  joinGroup,
  deleteGroup,
  passwordResetEmail,
  getCategory,
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  addToCart,
  getCart,
  deleteFromCart,
  decreaseCartItems,
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProduct,
  getProductByCategory,
  payment,
  verifyPayment,
};
