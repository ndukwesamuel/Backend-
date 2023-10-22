const Email = require("../Models/emailVerification");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/Users");
const { sendVerificationEmail } = require("../Middleware/Verification");

const emailVerification = async (req, res) => {
  const { userId, uniqueString } = req.body;

  try {
    userData = await Email.findOne({ userId }).sort({ createdAt: -1 });
    // console.log(userData);
    if (userData) {
      const expireAt = userData.expireAt;

      const hashedUniqueString = userData.uniqueString;

      // checking if the uniqueNumber has expired
      if (expireAt < Date.now()) {
        Email.deleteOne({ userId })
          .then((result) => {
            User.deleteOne({ _id: userId }).then(() => {
              res.status(200).json({ message: "link expired, signup again" });
            });
          })
          .catch((err) => {
            res.status(500).json("error occurred while deleting this user");
          });
      } else {
        // if unique string hasn't expire
        // compare the unique number with the one in the database

        bcrypt
          .compare(uniqueString, hashedUniqueString)
          .then((result) => {
            if (result) {
              User.updateOne({ _id: userId }, { verified: true })
                .then(() => {
                  Email.deleteOne({ userId })
                    .then(() => {
                      res.status(200).json({ message: "Email verified" });
                    })
                    .catch((err) => {
                      res
                        .status(500)
                        .json("email Verification data not deleted");
                    });
                })
                .catch((err) => {
                  res.status(500).json({ message: "update error" });
                });
            }
          })
          .catch((err) => {
            res.status(500).json({ message: "unique number not valid" });
          });
      }
    } else {
      res.json({
        error: true,
        message: "Email has been verified already!",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({ message: "Email has been verified already" });
  }
};

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  try {
    userData = await User.findOne({ email: email });
    if (userData === null) {
      res.status(500).json({ error: true, Message: "Email not registered" });
    } else {
      sendVerificationEmail(userData, res);
    }
  } catch (error) {
    res.status(500).json({ error: true, Message: "Email not registered" });
  }
};

module.exports = {
  resendVerificationEmail,
  emailVerification,
};
