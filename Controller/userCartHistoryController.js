const UserCartHistory = require("../Models/userCartHistory");
const GroupCartHistory = require("../Models/groupCartHistory");
const getAllUserCartHistory = async (req, res) => {
  try {
    const cartHistory = await UserCartHistory.find()
      .populate("userId", "fullName")
      .populate("productId");
    if (cartHistory.length === 0) {
      return res
        .status(200)
        .json({ message: "No cart history yet!", data: cartHistory });
    }
    res.status(200).json({ message: cartHistory });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message, message: "Internal server error" });
  }
};

const getCartHistoryByUserId = async (req, res) => {
  const userId = req.user.id;

  try {
    const userCartHistory = await UserCartHistory.find({
      userId: userId,
    })
      .populate("userId", "fullName")
      .populate("productId");
    if (userCartHistory.length === 0) {
      return res
        .status(200)
        .json({ message: "Cart history is empty", data: userCartHistory });
    }
    res.status(200).json({ message: userCartHistory });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message, message: "Internal server error" });
  }
};

const getAllGroupCartHistory = async (req, res) => {
  try {
    const groupCartHistory = await GroupCartHistory.find()
      .populate("groupId")
      .populate({
        path: "groupId",
        populate: { path: "members", select: "fullName" },
      })
      .populate({
        path: "groupId",
        populate: { path: "admins", select: "fullName" },
      })
      .populate("productId");
    if (groupCartHistory.length === 0) {
      return res
        .status(200)
        .json({ message: "No cart history yet!", data: groupCartHistory });
    }
    let overAllTotal = 0;
    groupCartHistory.forEach((data) => {
      overAllTotal += data.totalAmount;
    });
    console.log(overAllTotal);
    res
      .status(200)
      .json({ message: groupCartHistory, totalRevenue: overAllTotal });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message, message: "Internal server error" });
  }
};

const getCartHistoryByGroupId = async (req, res) => {
  const { id } = req.params;
  try {
    const groupCartHistory = await GroupCartHistory.find({
      groupId: id,
    })
      .populate("groupId")
      .populate({
        path: "groupId",
        populate: { path: "members", select: "fullName" },
      })
      .populate({
        path: "groupId",
        populate: { path: "admins", select: "fullName" },
      })
      .populate("productId");

    if (groupCartHistory.length === 0) {
      return res
        .status(200)
        .json({ message: "No cart history yet!", data: groupCartHistory });
    } else {
      res.status(200).json({ data: groupCartHistory });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message, message: "Internal server error" });
  }
};

const UpdateGroupOrderStatus = async (req, res) => {
  const { status, orderId } = req.body;
  if (status !== "processing" && status !== "completed") {
    return res
      .status(400)
      .json({ message: "Invalid status. Use 'processing' or 'completed'" });
  }

  try {
    const order = await GroupCartHistory.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "pending" && order.status !== "processing") {
      return res
        .status(400)
        .json({ message: `order is completed and cannot be modified` });
    }
    order.status = status;
    await order.save();

    res
      .status(200)
      .json({ data: order, message: "order updated successfully" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};
module.exports = {
  getAllUserCartHistory,
  getCartHistoryByUserId,
  getAllGroupCartHistory,
  getCartHistoryByGroupId,
  UpdateGroupOrderStatus,
};
