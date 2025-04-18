const jwt = require("jsonwebtoken");
const User = require("../Models/Users");
const { UnauthenticatedError } = require("../errors");
const { findUserProfileById } = require("../services/userService");
// create token for password hashing
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {});
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    // throw new UnauthenticatedError("Authentication invalid");

    return res
      .status(401)
      .json({ error: true, message: "Authentication invalid" });
  }
  const token = authHeader.split(" ")[1];
  if (token) {
    // decodedToken will return the user payload in this case userId
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        // redirect to the login page
        res.status(403).json({ error: true, message: "Invalid token" });
      } else {
        req.user = decodedToken;
        next();
      }
    });
  } else {
    res.status(401).json({ error: true, message: "You are not authenticated" });
  }
};
const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.userId === req.params.id) {
      next();
    } else {
      res.status(403).json({ error: true, message: "You are not authorized" });
    }
  });
};

const verifyCountry = async (req, res, next) => {
  // verifyToken(req, res, () => {
  let userId = req.user.userId;
  const userRes = await findUserProfileById(userId);
  req.userProfile = userRes;
  next();
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    User.findOne({ _id: req.user.userId })
      .then((data) => {
        if (data.isAdmin) {
          next();
        } else {
          res
            .status(403)
            .json({ error: true, message: "You are not authorized!" });
        }
      })
      .catch((error) => {
        res
          .status(403)
          .json({ error: true, message: "You are not authorized!" });
      });
  });
};
module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
  createToken,
  verifyCountry,
};
