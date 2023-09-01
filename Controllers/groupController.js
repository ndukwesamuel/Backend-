const Group = require("../Models/Group");
const { handleErrors } = require("../Middleware/errorHandler/function");

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

module.exports = { createGroup, getAllGroups, joinGroup, deleteGroup };
