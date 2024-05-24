const { StatusCodes } = require("http-status-codes");
const {
  handleErrors,
  getImageId,
} = require("../Middleware/errorHandler/function");
const Group = require("../Models/Group");
const Product = require("../Models/Products");
const Cart = require("../Models/Cart");
const groupmodel = require("../Models/Group");
const User = require("../Models/Users");
const { GroupTransfer } = require("../Models/Transaction");
const { BadRequestError } = require("../errors");
const UserProfile = require("../Models/UserProfile");
const UserCartHistory = require("../Models/userCartHistory");
const GroupCartHistory = require("../Models/groupCartHistory");

const createGroup = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.id;

  if (!name || !description) {
    throw new BadRequestError("Please provide name and description");
  }
  const creator = await User.findById(userId);
  if (!creator) {
    throw new BadRequestError("You need to login");
  }
  const creatorCountry = creator.country;

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
    country: creatorCountry,
  };
  const group = await groupmodel.create(newdata);
  res.status(StatusCodes.OK).json(group);
};

const joinGroup = async (req, res) => {
  const groupId = req.params.groupId;
  const group = await Group.findById(groupId);
  const userId = req.user.id;

  const user = await User.findById(userId);
  if (!user) {
    throw new BadRequestError("You need to login");
  }
  const userCountry = user.country;
  console.log(userCountry);

  if (!group) {
    throw new BadRequestError("Group not found");
  }

  // Check if the user is already a member of the group
  if (group.members.includes(userId)) {
    throw new BadRequestError("You are already a member of this group");
  }

  if (group.country !== userCountry) {
    throw new BadRequestError("You can only join groups from your country");
  }

  // Check if the user is already a member of any group (assuming same country restriction)
  const existingGroup = await Group.find({
    members: userId,
    country: userCountry,
  });

  if (existingGroup.length > 0) {
    throw new BadRequestError("You are already a member of another group!");
  }

  group.members.push(userId);
  await group.save();
  res.status(StatusCodes.OK).json(group);
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate({
        path: "members",
        select: "fullName wallet",
      })
      .lean();

    if (groups.length === 0) {
      return res.status(200).json({ message: "No group created yet" });
    } else {
      return res.status(200).json({ groups });
    }
  } catch (err) {
    // const error = handleErrors(err);
    return res.status(500).json({ message: err });
  }
};

const getAllGroupMembers = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate({
        path: "members",
        select: "fullName wallet country",
      })
      .lean();
    if (groups.length === 0) {
      return res.status(200).json({ message: "No group created yet" });
    } else {
      for (let group of groups) {
        for (let member of group.members) {
          const userProfile = await UserProfile.find({ user: member._id });
          member.address = userProfile ? userProfile[0]?.address : null;
        }
      }

      return res.status(200).json({ groups });
    }
  } catch (err) {
    // const error = handleErrors(err);
    console.log(err);
    return res.status(500).json({ message: err });
  }
};
const getMemberGroups = async (req, res) => {
  try {
    const groups = await groupmodel.findOne({ members: req.user.id });

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

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  // try {
  const groupId = req.params.groupId;

  // const group = await groupmodel.findById(groupId);

  const group = await Group.findById(groupId)
    .populate({
      path: "cart.userProductInfo.userId",
      model: "user",
      select: "fullName email", // Select the fields you want to include in the populated user
    })
    .exec();

  if (!group) {
    throw new BadRequestError("Group not found");
  }

  const cart = group.cart;

  res.status(200).json({ count: cart.length, data: cart });

  // res.status(200).json({ message: "Group cart", group });
};

const AddGroupCart = async (req, res) => {
  const { productId, groupId } = req.body;
  const userId = req.user.id;

  const user = await User.findById(userId);
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
    (item) => item.productId.toString() === productId
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

  // Check if the product already exists in the group's cart
  const existingCartItemIndex = group.cart.findIndex(
    (item) => item.productId.toString() === productId
  );
  // return console.log(existingCartItemIndex);
  if (existingCartItemIndex !== -1) {
    // If the product exists, update quantity and amount
    const existingCartItem = group.cart[existingCartItemIndex];
    existingCartItem.totalQuantity += itemToTransfer.quantity;
    existingCartItem.totalAmount +=
      itemToTransfer.price * itemToTransfer.quantity;

    // Update user-specific info for the existing product
    const existingUserProductInfoIndex =
      existingCartItem.userProductInfo.findIndex(
        (info) => info.userId.toString() === userId
      );

    if (existingUserProductInfoIndex !== -1) {
      // If user-specific info exists, update quantity and amount
      const existingUserProductInfo =
        existingCartItem.userProductInfo[existingUserProductInfoIndex];
      existingUserProductInfo.quantity += itemToTransfer.quantity;
      existingUserProductInfo.amount +=
        itemToTransfer.price * itemToTransfer.quantity;
    } else {
      // If user-specific info doesn't exist, add new user info
      existingCartItem.userProductInfo.push({
        userId: userId,
        quantity: itemToTransfer.quantity,
        amount: itemToTransfer.price * itemToTransfer.quantity,
      });
    }
  } else {
    // If the product doesn't exist, add it to the group's cart
    group.cart.push({
      userId: userId,
      userProductInfo: [
        {
          userId: userId,
          quantity: itemToTransfer.quantity,
          amount: itemToTransfer.price * itemToTransfer.quantity,
        },
      ],
      productId: productId,
      totalQuantity: itemToTransfer.quantity,
      totalAmount: itemToTransfer.price * itemToTransfer.quantity,
    });
  }

  // Update user's wallet and group's wallet
  user.wallet -= totalPrice;
  group.wallet += totalPrice;

  // Create transaction history
  const newTransaction = new GroupTransfer({
    sender: userId,
    group: groupId,
    amount: totalPrice,
  });
  await newTransaction.save();
  // create cart history before deleting
  const cartHistory = new UserCartHistory({
    userId: userId,
    productId: itemToTransfer.productId,
    quantity: itemToTransfer.quantity,
    price: itemToTransfer.price,
    name: itemToTransfer.name,
  });
  await cartHistory.save();
  // Update user's cart and remove transferred item
  userCart.items = userCart.items.filter(
    (item) => item.productId.toString() !== productId
  );
  userCart.bill -= totalPrice;
  await userCart.save();

  // Save updated user and group
  await user.save();
  await group.save();

  // Respond with success message and updated group cart
  res.status(200).json({
    message: "Product added to group cart",
    group: group.cart,
  });
};

const CheckoutGroupCart = async (req, res) => {
  try {
    const { productId, groupId } = req.body;
    const userId = req.user.id;
    const group = await groupmodel.findById(groupId);
    const isUser = await User.findOne({ _id: userId });

    if (!isUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is a member of the group
    if (!group.members.includes(userId)) {
      return res
        .status(401)
        .json({ message: "You are not a member of the group" });
    }

    // Check if the user is an admin of the group
    const isAdmin = group.admins.includes(userId);

    if (!isAdmin) {
      return res.status(401).json({ message: "You are not the group admin" });
    }

    // Find the cart item corresponding to the provided productId
    const cartItem = group.cart.find(
      (item) => item.productId.toString() === productId
    );
    if (!cartItem) {
      return res.status(404).json({ message: "Product not found in the cart" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const amount = cartItem.totalAmount;
    if (group.wallet < amount) {
      return res
        .status(400)
        .json({ message: "Insufficient funds in the wallet" });
    }

    // Deduct the amount from the group's wallet and update the group's bill
    group.wallet -= amount;
    group.bill = amount;
    // Create group cart history for each product to be checked out
    const groupHistory = new GroupCartHistory({
      groupId: groupId,
      productId: cartItem.productId,
      totalQuantity: cartItem.totalQuantity,
      totalAmount: cartItem.totalAmount,
    });
    await groupHistory.save();
    // Remove the checked out product from the cart
    group.cart = group.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    await group.save();

    res.status(200).json({ message: "Product checked out successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const GroupcartCheckout = async (req, res) => {
  console.log("hello");
  let { cartItemId, productId, groupid } = req.body;
  const group = await groupmodel.findById(groupid);
  // Create an array to store product details
  const productDetails = [];

  for (const cartItem of group.cart) {
    const productId = cartItem.productId;
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
  const totalAmount = productDetails.reduce((total, productDetail) => {
    return total + productDetail.amount;
  }, 0);

  res.status(200).json({
    // productDetails,
    // totalAmount,
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
  getAllGroupMembers,
  joinGroup,
  deleteGroup,
  getGroupCart,
  AddGroupCart,
  updateSingleGroupCart,
  DeleteSingleGroupCart,
  getMemberGroups,
  CheckoutGroupCart,
  GroupcartCheckout,
};
