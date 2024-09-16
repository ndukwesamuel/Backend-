<<<<<<< HEAD
const asyncHandler = require("express-async-handler");

const getData = asyncHandler(async (req, res) => {
=======
// Don't delete. this is to keep the server alive

const getData = async (req, res) => {
>>>>>>> b01c87b09b56d198397fb3d785b1ce110513e468
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
<<<<<<< HEAD
});

const register = asyncHandler(async (req, res) => {});
=======
};
>>>>>>> b01c87b09b56d198397fb3d785b1ce110513e468

module.exports = {
  getData,
};
