const jwt = require("jsonwebtoken");

// create token for password hashing
const validTime = 60 * 60; // in seconds
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: validTime });
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
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
    // redirect to the login page

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
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ error: true, message: "You are not authorized" });
    }
  });
};
module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
  createToken,
};
