const Cart = require("../Models/Cart");
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

module.exports = {
  addToCart,
  getCart,
  deleteFromCart,
  decreaseCartItems,
};
