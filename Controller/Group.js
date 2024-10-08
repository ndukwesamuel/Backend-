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
const asyncWrapper = require("../Middleware/asyncWrapper");
const { findUserProfileById } = require("../services/userService");
const {
  findGroupById,
  isUserInAnyGroup,
  requesting_user_member_group_level,
  findGroups_info,
} = require("../services/groupService");

const createGroup = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user.userId;

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

const Group__add_members = async (req, res) => {
  const { userIdToAdd, groupId } = req.body;
  const requestingUserId = req?.user?.userId;

  const group = await findGroupById(groupId);
  const { isAdmin, isMember } = await requesting_user_member_group_level(
    group,
    requestingUserId
  );

  const othergroups = await Group.find({ members: userIdToAdd })
    .populate("members")
    .exec();

  if (othergroups?.length > 0) {
    return res.status(404).json({ message: "User is  a member of a groups." });
  }
  // If the requesting user is an admin, add the new user to the members array
  if (isAdmin) {
    group.members.push(userIdToAdd);
  } else {
    // Otherwise, add the new user to the pendingMembers array
    group.pendingMembers.push(userIdToAdd);
  }

  await group.save();
  res.status(StatusCodes.OK).json({
    group,
  });
};

const Group__Remove_members = async (req, res) => {
  const { userIdToAdd, groupId } = req.body;
  const requestingUserId = req?.user?.userId;

  if (userIdToAdd === requestingUserId) {
    return res.status(404).json({ message: "You cant remove your self" });
  }

  const group = await findGroupById(groupId);
  const { isAdmin, isMember } = await requesting_user_member_group_level(
    group,
    requestingUserId
  );

  const member_to_delete_info = await requesting_user_member_group_level(
    group,
    userIdToAdd
  );

  if (!member_to_delete_info?.isMember) {
    return res
      .status(404)
      .json({ message: "User is not a member of  our  groups." });
  }

  if (!isAdmin) {
    return res.status(404).json({ message: "You are not a Group admin" });
  }
  group.members.pull(userIdToAdd);

  // Save the group
  await group.save();
  res.status(StatusCodes.OK).json({
    group,
    message: "Member removed successfully",
  });
};

const joinGroup = asyncWrapper(async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user?.userId;

  const findUserProfileByIdrespons = await findUserProfileById(userId);

  const isUserInAnyGrouprespons = await isUserInAnyGroup(userId);

  const grouprespons = await findGroupById(groupId);

  if (isUserInAnyGrouprespons) {
    return res.status(400).json({
      message: "User is already a member or has a pending request",
    });
  }

  let user_country = findUserProfileByIdrespons?.user?.country;
  let group_country = grouprespons?.country;

  if (user_country !== group_country) {
    return res.status(400).json({
      message: "You can only join groups from your country",
    });
  }

  grouprespons.pendingMembers.push(userId);
  await grouprespons.save();

  res.status(200).json({ message: "Request to join group sent" });
});

const All_Group_members_Info = asyncWrapper(async (req, res) => {
  const groupId = req.params.groupId;
  const group = await Group.findById(groupId)
    .populate({
      path: "members",
      model: User, // Adjust the path as needed
    })
    .populate({
      path: "pendingMembers",
      model: User, // Adjust the path as needed
    });

  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }
  res.json({
    data: {
      members: group.members,
      pendingMembers: group.pendingMembers,
    },
  });
});

const All_User_That_can_join_Group = asyncWrapper(async (req, res) => {
  const groupId = req.params.groupId;
  const group = await Group.findById(groupId)
    .populate({
      path: "members",
      model: User, // Adjust the path as needed
    })
    .populate({
      path: "pendingMembers",
      model: User, // Adjust the path as needed
    });

  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  const usersInSameCountry = await User.find({ country: group.country });
  // const usersNotInAnyGroup = usersInSameCountry.filter(async (user) => {
  //   const isMember = await Group.exists({ members: user._id });
  //   const isAdmin = await Group.exists({ admins: user._id });
  //   return !isMember && !isAdmin;
  // });

  res.json({
    data: {
      usersInSameCountry, // eligibleUsers.group.country,
    },
  });
});

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

const usergetAllGroups = asyncWrapper(async (req, res) => {
  // try {
  const userId = req.user.userId;

  const findUserProfileByIdrespons = await findUserProfileById(userId);

  let user_country = findUserProfileByIdrespons?.user?.country;
  let search_data = {
    country: user_country,
  };

  const groups = await findGroups_info(search_data);

  return res.status(200).json({ groups });
});

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
  const userId = req.user.userId;
  try {
    const groups = await groupmodel.findOne({ members: req.user.userId });

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
  const userId = req.user.userId;

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
  const userId = req.user.userId;

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
    const userId = req.user.userId;
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
  const userId = req.user.userId;
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

  All_Group_members_Info,
  All_User_That_can_join_Group,
  Group__add_members,
  Group__Remove_members,
  usergetAllGroups,
};
