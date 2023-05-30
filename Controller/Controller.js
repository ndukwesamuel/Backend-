const asyncHandler = require("express-async-handler");
const { handleErrors } = require("./Middleware/errorHandler/function");
const User = require("../Models/Users");

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
    res.status(201).json({ saveduser });
  } catch (err) {
    const error = handleErrors(err);
    res.status(500).json({ message: error });
  }
});

module.exports = {
  getData,
  register,
};
