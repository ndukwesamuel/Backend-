const jwt = require("jsonwebtoken");
const User = require("../Models/Users");
const { UnauthenticatedError } = require("../errors");
// create token for password hashing
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {});
};

const verifyToken = async (req, res, next) => {
  console.log(req.headers);
  const authHeader = req.headers.authorization;

  console.log(authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthenticatedError("Authentication invalid");
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
    if (req.user.id === req.params.id) {
      next();
    } else {
      res.status(403).json({ error: true, message: "You are not authorized" });
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    User.findOne({ _id: req.user.id })
      .then((data) => {
        data.isAdmin;
        next();
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
};
