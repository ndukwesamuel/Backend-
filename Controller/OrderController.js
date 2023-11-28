const Order = require("../Models/Order");
const OrderItem = require("../Models/OrderItems");

// NOTE: NONE OF THIS ROUTE IS RESTRICTED AND SO I PASSED THE USER ID AS EITHER A BODY OR PARAMS. IF THIS IS WHAT WE WANT, I WILL RESTRICT THEM AND GET THE USER ID FROM req.user.id

const orderList = async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(404).json({ success: false, message: "No order yet" });
  }
  res.status(200).send(orderList);
};

const orderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
      },
    });

  if (!order) {
    res.status(404).json({ success: false, message: "Order can't be found" });
  }
  res.status(200).send(order);
};

const creatOrder = async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();

  if (!order) return res.status(400).send("the order cannot placed!");

  res.status(201).json({
    message: "Order has been placed",
    order,
  });
};

const updateOrder = async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!order) return res.status(400).send("the order cannot be update!");

  res.status(200).send(order);
};

const deleteOrder = (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "the order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
};

const userOrder = async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userId })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
      },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    res
      .status(404)
      .json({ success: false, message: "No order yet: Place one now!" });
  }
  const userOrder = userOrderList.map((userOrder) => {
    return userOrder.orderItems;
  });
  res.status(200).send(userOrder);
};

module.exports = {
  orderList,
  orderById,
  creatOrder,
  updateOrder,
  deleteOrder,
  userOrder,
};
