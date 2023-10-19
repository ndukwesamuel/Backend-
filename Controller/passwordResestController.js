const userPasswordReset = require("../Models/passwordReset");
const bcrypt = require("bcrypt");
const User = require("../Models/Users");
const { sendPasswordResetEmail } = require("../Middleware/Verification");

const passwordResetEmail = async (req, res) => {
  const { email } = req.body;
  try {
    userData = await User.findOne({ email });
    if (userData) {
      // Check if the user has been verified before sending password reset email
      if (userData.verified) {
        sendPasswordResetEmail(userData, res);
      } else {
        res.status(401).json({ message: "Email has not been verified" });
      }
    } else {
      res.status(404).json({ message: "Email not registered" });
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

const resetPassword = async (req, res) => {
  const { userId, uniqueString, newPassword } = req.body;
  try {
    userData = await userPasswordReset
      .findOne({ userId })
      .sort({ createdAt: -1 });
    if (userData) {
      const expireAt = userData.expireAt;

      const hashedUniqueString = userData.uniqueString;

      // checking if the uniqueString has expired
      if (expireAt < Date.now()) {
        userPasswordReset
          .deleteOne({ userId })
          .then((result) => {
            res.status(200).json({
              error: true,
              message: "link expired, request for new link",
            });
          })
          .catch((err) => {
            res
              .status(500)
              .json("error occurred while deleting this user password reset");
          });
      } else {
        // if unique string hasn't expire
        // compare the unique string with the one in the database
        bcrypt
          .compare(uniqueString, hashedUniqueString)
          .then((result) => {
            if (result) {
              //  Hass the new password
              bcrypt
                .hash(newPassword, 10)
                .then((hashedPassword) => {
                  // Update password
                  User.updateOne(
                    { _id: userId },
                    { password: hashedPassword }
                  ).then(() => {
                    // delete reset data from db
                    userPasswordReset
                      .deleteOne({ userId })
                      .then((response) => {
                        res.json({ message: "password reset successfully" });
                      })
                      .catch((err) => {
                        res.json({ message: "deleting reset data failed" });
                      });
                  });
                })
                .then((result) => {})
                .catch((err) => {
                  res.json({ message: "password not updated" });
                })
                .catch((err) => {
                  res.json({ message: "Error while hashing password" });
                });
            } else {
              res.json({
                error: true,
                message: "Invalid password reset details",
              });
            }
          })
          .catch((err) => {
            res.status(500).json({ message: "unique string not valid" });
          });
      }
    } else
      res
        .status(404)
        .json({ message: "Invalid details: Use the link in your mail!" });
  } catch (err) {
    console.log(err);
    res.status(404).json("Invalid id");
  }
};

module.exports = {
  passwordResetEmail,
  resetPassword,
};
