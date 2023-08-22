require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { handleErrors } = require("../Middleware/errorHandler/function");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../Middleware/Verification");
const { createToken, verifyToken } = require("../Middleware/auth");
const User = require("../Models/Users");
const Email = require("../Models/emailVerification");
const userPasswordReset = require("../Models/passwordReset");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = new User({
    fullName: name,
    email: email,
    password: password,
  });

  try {
    savedUser = await newUser.save();
    sendVerificationEmail(savedUser, res);
    // res.status(201).json({ savedUser });
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ message: error });
  }
};

const login = async (req, res) => {
  const { password, email } = req.body;
  try {
    const user = await User.login(email, password);
    if (user.verified) {
      const token = createToken(user._id);

      const { password, ...others } = user._doc;
      res.status(200).json({ ...others, token });
    } else {
      res.status(401).json({ message: "Verify email to login" });
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({ error });
  }
};

const logout = async (req, res) => {
  const authHeader = req.headers.token;
  jwt.sign(
    authHeader,
    "",
    {
      expiresIn: 1,
    },
    (logout, err) => {
      if (logout) {
        res.status(200).json({ message: "Logged out" });
      } else {
        res.status(401).json({ message: err });
      }
    }
  );
};

const emailVerification = async (req, res) => {
  const { userId, uniqueString } = req.body;

  try {
    userData = await Email.findOne({ userId }).sort({ createdAt: -1 });
    console.log(userData);
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

// Requesting for password reset email
const passwordResetEmail = async (req, res) => {
  const { email, redirectUrl } = req.body;
  try {
    userData = await User.findOne({ email });
    if (userData) {
      // Check if the user has been verified before sending password reset email
      if (userData.verified) {
        sendPasswordResetEmail(userData, redirectUrl, res);
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
  register,
  login,
  logout,
  emailVerification,
  resendVerificationEmail,
  resetPassword,
  passwordResetEmail,
};
