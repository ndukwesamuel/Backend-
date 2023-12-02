const Cart = require("../Models/Cart");
const product = require("../Models/Products");
// GET cart for a user
const getCart = async (req, res) => {
  try {
    let userId = req.user.id;
    // Find the user's cart based on userId and populate product details including image
    const userCart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      model: product,
      select: "name price image", // Include the "image" field from the product
    });

    if (!userCart) {
      return res.status(200).json({ message: "Cart is empty" });
    } else {
      return res.status(200).json({ userCart });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
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
  console.log(req.user.id);
  const { productId, quantity } = req.body;

  const userId = req.user.id;
  const quantityToRemove = quantity || 1;

  try {
    const userCart = await Cart.findOne({ userId });

    if (!userCart) {
      return res.status(404).json({ message: "User cart not found" });
    }

    // Find the product based on productId
    const productDetails = await product.findById(productId);

    if (!productDetails) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the item in the cart
    const cartItemIndex = userCart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({ message: "Product not found in the cart" });
    }

    // Check if the quantity to remove is greater than the current quantity in the cart
    if (quantityToRemove > userCart.items[cartItemIndex].quantity) {
      return res.status(400).json({ message: "Invalid quantity to remove" });
    }

    // Update the quantity and price in the cart
    userCart.items[cartItemIndex].quantity -= quantityToRemove;
    userCart.items[cartItemIndex].price -=
      quantityToRemove * productDetails.price;

    // If the quantity becomes 0, remove the item from the cart
    if (userCart.items[cartItemIndex].quantity === 0) {
      userCart.items.splice(cartItemIndex, 1);
    }

    // Update the total bill in the cart
    userCart.bill = userCart.items.reduce(
      (total, item) => total + item.price,
      0
    );

    // Save the updated cart
    await userCart.save();

    res.json({
      message: "Quantity removed successfully",
      item: userCart.items[cartItemIndex],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }

  // try {
  //   const cart = await Cart.find();
  //   // const cart = await Cart.findOne({ userId: req.user.id });
  //   console.log({ cart });
  //   const index = cart.items.findIndex(
  //     (item) => item.productId == req.body.productId
  //   );

  //   // console.log({ cart, index });

  //   if (index === -1) {
  //     return res.status(404).json({ message: "Item not found in cart" });
  //   } else {
  //     if (cart.items[index].quantity > 1) {
  //       cart.items[index].quantity -= 1;
  //       cart.bill -= cart.items[index].price;
  //       await cart.save();
  //       res.status(200).json(cart);
  //     } else {
  //       cart.items.splice(index, 1);
  //       cart.bill = 0;
  //       await cart.save();
  //       res.status(200).json(cart);
  //     }
  //   }
  // } catch (error) {
  //   res.status(404).json({ message: "Cart is empty" });
  // }
};
// REMOVES an item from cart at once
const deleteFromCart = async (req, res) => {
  console.log({ req: req.body });
  // const { productId } = req.body;
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

module.exports = {
  addToCart,
  getCart,
  deleteFromCart,
  decreaseCartItems,
};
