const Cart = require("../Models/Cart");
const product = require("../Models/Products");
// GET cart for a user
const getCart = async (req, res) => {
  try {
    let userId = req.user.userId;

    const userCart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      model: "product",
    });

    if (!userCart) {
      return res.status(200).json({ message: "Cart is empty" });
    } else {
      return res.status(200).json({ userCart });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addToCart = async (req, res) => {
  let { productId } = req.query;

  try {
    let cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      // Create a new cart if one doesn't exist for the user
      const newCart = new Cart({
        userId: req.user.userId,
        items: [{ productId, quantity: 1 }], // Set initial quantity to 1
      });
      await newCart.save();

      // Populate product details in the response
      await newCart.populate("items.productId");

      res.status(200).json(newCart);
    } else {
      // Add the item to the existing cart
      const index = cart.items.findIndex((item) => item.productId == productId);

      if (index === -1) {
        // Add the item if it doesn't already exist in the cart
        cart.items.push({ productId, quantity: 1 }); // Set initial quantity to 1
      } else {
        // Update the quantity of the item if it already exists in the cart
        cart.items[index].quantity += 1; // Increment quantity by 1
      }

      await cart.save();

      // Populate product details in the response
      cart = await cart.populate("items.productId");

      res.status(200).json(cart);
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while adding to the cart." });
  }
};

const removeFromCart = async (req, res) => {
  let { productId } = req.query;

  try {
    let cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found." });
    }

    const index = cart.items.findIndex((item) => item.productId == productId);

    if (index === -1) {
      return res.status(404).json({ error: "Item not found in cart." });
    }

    // Decrement the quantity of the item
    cart.items[index].quantity -= 1;

    // Remove the item if the quantity reaches zero
    if (cart.items[index].quantity === 0) {
      cart.items.splice(index, 1); // Remove the item from the array
    }

    await cart.save();

    // Populate product details in the response
    cart = await cart.populate("items.productId");

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while removing from the cart." });
  }
};

// Decrease items quantity
const decreaseCartItems = async (req, res) => {
  console.log(req.user.userId);
  const { productId, quantity } = req.body;

  const userId = req.user.userId;
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

    // res.status(200).json({
    //   message: "Item quantity decreased successfully",
    //   productId,
    //   productDetails,
    //   quantityToRemove
    // });

    res.json({
      message: "Quantity removed successfully",
      item: userCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }

  // try {
  //   const cart = await Cart.find();
  //   // const cart = await Cart.findOne({ userId: req.user.userId });
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
    const cart = await Cart.findOne({ userId: req.user.userId });
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
  removeFromCart,
};
