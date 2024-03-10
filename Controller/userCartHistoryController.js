const UserCartHistory = require("../Models/userCartHistory");
const GroupCartHistory = require("../Models/groupCartHistory");
const getAllUserCartHistory = async (req, res) => {
  try {
    const cartHistory = await UserCartHistory.find().populate(
      "userId",
      "fullName"
    );
    if (cartHistory.length === 0) {
      return res.status(404).json({ message: "No cart history yet!" });
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
    }).populate("userId", "fullName");
    if (userCartHistory.length === 0) {
      return res.status(404).json({ message: "Cart history is empty" });
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
    const groupCartHistory = await GroupCartHistory.find().populate(
      "groupId",
      "name"
    );
    if (groupCartHistory.length === 0) {
      return res.status(404).json({ message: "No cart history yet!" });
    }
    res.status(200).json({ message: groupCartHistory });
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
    }).populate("groupId", "name");
    if (groupCartHistory.length === 0) {
      return res.status(404).json({ message: "No cart history yet!" });
    }
    res.status(200).json({ message: groupCartHistory });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message, message: "Internal server error" });
  }
};
module.exports = {
  getAllUserCartHistory,
  getCartHistoryByUserId,
  getAllGroupCartHistory,
  getCartHistoryByGroupId,
};
