const Email = require("../Models/emailVerification");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/Users");
const {
  sendVerificationEmail,
  BrevosendVerificationEmail,
} = require("../Middleware/Verification");
const asyncWrapper = require("../Middleware/asyncWrapper");

const emailVerification = asyncWrapper(async (req, res) => {
  const { userId, uniqueString } = req.body;

  // try {
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found", user });
  }

  if (user.verified) {
    return res
      .status(400)
      .json({ message: "Email has already been verified!" });
  }

  const userData = await Email.findOne({ userId }).sort({ createdAt: -1 });

  if (!userData) {
    return res.status(400).json({ message: "No verification data found" });
  }

  const { expireAt, uniqueString: hashedUniqueString } = userData;

  if (expireAt < Date.now()) {
    await Email.deleteOne({ userId });
    await User.deleteOne({ _id: userId });
    return res.status(200).json({ message: "Link expired, signup again" });
  }

  const isMatch = await bcrypt.compare(uniqueString, hashedUniqueString);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid unique string" });
  }

  await User.updateOne({ _id: userId }, { verified: true });
  await Email.deleteOne({ userId });
  res.status(200).json({ message: "Email verified" });
});

const resendVerificationEmailNew = async (req, res) => {
  const { email } = req.body;
  try {
    // userData = await User.findOne({ email: email });
    userData = await User.findOne({ email: email });
    if (userData === null) {
      res
        .status(500)
        .json({ error: true, Message: "Email not registered", userData });
    } else {
      // sendVerificationEmail(userData, res);
      const result = await BrevosendVerificationEmail(savedUser);
      res.status(200).json({ result });
    }
  } catch (error) {
    res.status(500).json({ error: true, Message: "Email not registered" });
  }
};

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  const userData = await User.findOne({ email: email });

  try {
    if (userData === null) {
      res.status(500).json({ error: true, Message: "Email not registered" });
    }
    if (userData?.verified) {
      res.status(200).json({ message: "Email has already been verified!" });
    } else {
      const result = await BrevosendVerificationEmail(userData);
      res.status(200).json({ result });
    }
  } catch (error) {
    res.status(500).json({ error: true, Message: error });
  }
};

module.exports = {
  resendVerificationEmail,
  emailVerification,
};
