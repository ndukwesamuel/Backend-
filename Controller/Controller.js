const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { handleErrors } = require("../Middleware/errorHandler/function");
const { sendVerificationEmail } = require("../Middleware/Verification");
const { createToken, verifyToken } = require("../Middleware/auth");
const User = require("../Models/Users");
const Group = require("../Models/Group");
const Email = require("../Models/emailVerification");

const getData = asyncHandler(async (req, res) => {
  let data = [
    { name: "tunde", id: 1 },
    { name: "emeka", id: 2 },
    { name: "kaka", id: 3 },
    { name: "peter", id: 4 },

    { name: "kaka", id: 3 },
    { name: "peter", id: 4 },
    { name: "kaka", id: 3 },
    { name: "peter", id: 4 },
    { name: "kaka", id: 3 },
    { name: "peter", id: 4 },
    { name: "kaka", id: 3 },
    { name: "peter", id: 4 },
    { name: "kaka", id: 3 },
    { name: "peter", id: 4 },
  ];

  res.status(200).json(data);
});

const register = asyncHandler(async (req, res) => {
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
});

const login = asyncHandler(async (req, res) => {
  const { password, email } = req.body;
  try {
    const user = await User.login(email, password);
    if (user) {
      const token = createToken(user._id);

      const { password, ...others } = user._doc;
      res.status(200).json({ ...others, token });
    }
  } catch (err) {
    const error = handleErrors(err);
    res.status(400).json({ error });
  }
});

const emailVerification = asyncHandler(async (req, res) => {
  const { userId, uniqueNumber } = req.body;

  try {
    userData = await Email.findOne({ userId });

    if (userData) {
      const expireAt = userData.expireAt;

      const hashedUniqueNumber = userData.uniqueNumber;

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
          .compare(uniqueNumber, hashedUniqueNumber)
          .then((result) => {
            if (result) {
              User.updateOne({ _id: userId }, { verified: true })
                .then(() => {
                  Email.deleteOne({ userId })
                    .then(() => {
                      res.status(200).json({ message: "Email verified" });
                    })
                    .catch((err) => {
                      console.log(err);

                      res
                        .status(500)
                        .json("email Verification data not deleted");
                    });
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).json({ message: "update error" });
                });
            }
          })
          .catch((err) => {
            console.log(err);

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
});

const resendOTP = asyncHandler(async (req, res) => {
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
});
const group = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findOne({ _id: userId });
    if (user) {
      const groupCreated = await Group.create({ name, userAdminId: userId });
      if (groupCreated) {
        User.updateOne({ _id: userId }, { isUserAdmin: true })
          .then((data) => {})
          .catch((error) => {});
      } else {
        res.status(500).json({ error: true, message: "Group not created" });
      }
    }
    res.status(200).json({ message: "Group created" });
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ message: error });
  }
});

//  for testing the verifyToken middleware
const home = asyncHandler(async (req, res) => {
  res.send("this is the home");
});
module.exports = {
  getData,
  register,
  login,
  group,
  emailVerification,
  home,
  resendOTP,
};
