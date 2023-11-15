const { StatusCodes } = require("http-status-codes");
const {
  handleErrors,
  getImageId,
} = require("../Middleware/errorHandler/function");
const Group = require("../Models/Group");
const Product = require("../Models/Products");
const Cart = require("../Models/Cart");
const groupmodel = require("../Models/Group");

const Users = require("../Models/Users");

const { BadRequestError } = require("../errors");
const { log } = require("console");
const { isValidObjectId } = require("mongoose");

const createGroup = async (req, res) => {
  const { name, description } = req.body;
  const creator = req.user.id;

  if (!name || !description) {
    throw new BadRequestError("Please provide name and description");
  }

  const isAdminOfAnyGroup = await groupmodel.exists({
    $or: [
      { creator: creator }, // User is the creator of a group
      { admins: creator }, // User is listed in the admins of a group
    ],
  });

  if (isAdminOfAnyGroup) {
    throw new BadRequestError("You cannot create a group as an admin");
  }

  let newdata = {
    name,
    description,
    creator,
    members: [creator],
    admins: [creator],
  };

  const group = await groupmodel.create(newdata);

  res.status(StatusCodes.OK).json(group);
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await groupmodel.find();
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

const getMemberGroups = async (req, res) => {
  console.log({ req: req.user });
  try {
    const groups = await groupmodel.findOne({ members: req.user.id });

    console.log({ groups });

    if (!groups) {
      res.status(200).json({ message: "You are not in any Group " });
    } else {
      res.status(200).json({ groups });
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ message: error });
  }
};

const getGroupCart = async (req, res) => {
  const userId = req.user.id;

  const user = await Users.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  // try {
  const groupId = req.params.groupId;

  const group = await groupmodel.findById(groupId);

  //   .populate({
  //   path: "cart.productId", // This should match the name of the field in your 'group' model
  //   model: "product", // The name of your product model
  // });

  const cart = group.cart;

  if (!group) {
    throw new BadRequestError("Group not found");
  }

  // res.status(200).json({ count: group.cart.length, data: group.cart });

  res.status(200).json({ cart });
};

const AddGroupCart = async (req, res) => {
  const { productId, cartItemId, groupId } = req.body;

  const userId = req.user.id;

  const user = await Users.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const group = await groupmodel.findById(groupId);

  if (!group) {
    throw new BadRequestError("Group not found");
  }

  if (!group.members.includes(`${user._id}`)) {
    throw new BadRequestError("You are not a member of this Group");
  }

  const userCart = await Cart.findOne({ userId: userId });
  if (!userCart) {
    return res.status(404).json({ error: "User's cart not found" });
  }
  const itemToTransfer = userCart.items.find(
    (item) => item._id.toString() === cartItemId && item.productId === productId
  );

  if (!itemToTransfer) {
    return res
      .status(404)
      .json({ error: "Product not found in the user's cart" });
  }

  const totalPrice = itemToTransfer.price * itemToTransfer.quantity;

  if (user.wallet < totalPrice) {
    return res.status(400).json({ error: "Insufficient funds in the wallet" });
  }
  const isProductInGroupCartForUser = group.cart.some((item) =>
    item.userProductInfo.some((info) => info.userId.toString() === userId)
  );

  if (isProductInGroupCartForUser) {
    return res
      .status(400)
      .json({ error: "You have already added this product to the group cart" });
  }

  const quantityToTransfer = itemToTransfer.quantity; // Calculate the quantity to transfer

  // Find the item in the group's cart based on productId
  const groupCartItem = group.cart.find((item) => item.productId === productId);

  if (groupCartItem) {
    // Update totalQuantity and totalAmount
    groupCartItem.totalQuantity += quantityToTransfer;
    groupCartItem.totalAmount += itemToTransfer.price * quantityToTransfer;

    // Add user-specific info to the existing product in the group's cart
    groupCartItem.userProductInfo.push({
      userId: userId,
      quantity: quantityToTransfer,
      amount: itemToTransfer.price * quantityToTransfer,
    });

    // Remove the product from the user's cart
    userCart.items = userCart.items.filter(
      (item) => item.productId !== productId
    );
  } else {
    // Create a new item in the group's cart
    group.cart.push({
      userId,
      userProductInfo: [
        {
          userId: userId,
          quantity: quantityToTransfer,
          amount: itemToTransfer.price * quantityToTransfer,
        },
      ],
      productId,
      totalQuantity: quantityToTransfer,
      totalAmount: itemToTransfer.price * quantityToTransfer,
    });
  }

  user.wallet -= totalPrice;
  group.wallet += totalPrice;
  await group.save();

  await user.save();

  // Update the user's cart
  itemToTransfer.quantity -= itemToTransfer.quantity;
  itemToTransfer.price -= totalPrice;

  userCart.items = userCart.items.filter(
    (item) => item._id.toString() !== cartItemId
  );
  await userCart.save();

  res.status(200).json({
    message: "Product added to group cart",
    userCart: itemToTransfer,
    productId,
    cartItemId,
    group: group.cart,
  });
};

const CheckoutGroupCasrt = async (req, res) => {
  // // try {
  const groupId = req.params.groupId;
  // const { productId, quantity } = req.body;
  const group = await groupmodel.findById(groupId);
  let cartitem = group?.cart;
  console.log(cartitem);

  let product = await Product.find({});

  console.log({ product });

  // if (!product) {
  //   throw new BadRequestError("Procduct not found");
  // }
  // const group = await groupmodel.findById(groupId); //.populate("cart.product");

  // if (!group) {
  //   throw new BadRequestError("Group not found");
  // }

  // // Check if the product is already in the cart
  // const existingProductIndex = group.cart.findIndex(
  //   (item) => item.product.toString() === productId
  // );

  // if (existingProductIndex !== -1) {
  //   // If the product is already in the cart, update the quantity
  //   // group.cart[existingProductIndex].quantity += quantity;
  //   return res.status(200).json({ message: "Product already in cart" });
  // } else {
  //   // If the product is not in the cart, add it
  //   group.cart.push({ product: productId, quantity });
  // }
  // await group.save();

  res.status(200).json({ message: "Product added to the cart successfully" });
};

const CheckoutGroupCart = async (req, res) => {
  const groupId = req.params.groupId;
  const group = await groupmodel.findById(groupId);

  // Create an array to store product details
  const productDetails = [];

  // Loop through each item in group.cart and fetch product details
  for (const cartItem of group.cart) {
    const productId = cartItem.product;
    const product = await Product.findById(productId); // Find product by its _id

    if (product) {
      let amount = product.price * cartItem.quantity;
      // If the product is found, add its details to the array
      productDetails.push({
        cartItem: cartItem,
        name: product.name,
        price: product.price,
        description: product.description,
        category: product.category,
        id: product._id,
        amount,
      });
    }
  }

  // Calculate the total amount by summing up the 'amount' property of each product detail
  const totalAmount = productDetails.reduce((total, productDetail) => {
    return total + productDetail.amount;
  }, 0);

  res.status(200).json({
    productDetails,
    totalAmount,
  });
};

const updateSingleGroupCart = async (req, res) => {
  // try {
  const groupId = req.params.groupId;
  const { productId, quantity } = req.body;

  let product = await Product.find({ _id: productId });
  if (!product) {
    throw new BadRequestError("Procduct not found");
  }
  const group = await groupmodel.findById(groupId); //.populate("cart.product");

  if (!group) {
    throw new BadRequestError("Group not found");
  }

  // Check if the product is already in the cart
  // Find the product in the cart by its productId
  const cartItem = group.cart.find(
    (item) => item.product.toString() === productId
  );

  if (!cartItem) {
    return res.status(404).json({ message: "Product not found in the cart" });
  }

  // Update the quantity of the product
  cartItem.quantity = quantity;
  // Save the updated group document
  await group.save();

  res.status(200).json({ message: "Product quantity updated successfully" });
};

const DeleteSingleGroupCart = async (req, res) => {
  // try {
  const groupId = req.params.groupId;
  const { productId, quantity } = req.body;

  let product = await Product.find({ _id: productId });
  if (!product) {
    throw new BadRequestError("Procduct not found");
  }
  const group = await groupmodel.findById(groupId); //.populate("cart.product");

  if (!group) {
    throw new BadRequestError("Group not found");
  }

  const cartItem = group.cart.find(
    (item) => item.product.toString() === productId
  );

  if (!cartItem) {
    return res.status(404).json({ message: "Product not found in the cart" });
  }

  // Filter the cart to remove the cartItem by productId
  group.cart = group.cart.filter(
    (item) => item.product.toString() !== productId
  );

  // Save the updated group document with the cartItem removed
  await group.save();
  res.status(200).json({
    message: "Product removed from the cart successfully",
    data: group.cart,
  });
};

const joinGroup = async (req, res) => {
  const groupId = req.params.groupId;
  const group = await Group.findById(groupId);
  const userId = req.user.id;

  if (!group) {
    throw new BadRequestError("Group not found");
  }

  // Check if the user is already a member of the group
  if (group.members.includes(userId)) {
    throw new BadRequestError("You are already a member of this group");
  }
  group.members.push(userId);
  await group.save();
  res.status(StatusCodes.OK).json(group);
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

module.exports = {
  createGroup,
  getAllGroups,
  joinGroup,
  deleteGroup,
  getGroupCart,
  AddGroupCart,
  updateSingleGroupCart,
  DeleteSingleGroupCart,
  getMemberGroups,
  CheckoutGroupCart,
};
