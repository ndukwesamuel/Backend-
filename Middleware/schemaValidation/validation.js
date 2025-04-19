const { ZodError } = require("zod");
function validateData(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));
        res.status(422).json({ errors: errorMessages });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));
        res.status(422).json({ errors: errorMessages });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  };
}

function parseMultipartJson(req, res, next) {
  if (req.body.products && typeof req.body.products === "string") {
    try {
      req.body.products = JSON.parse(req.body.products);
    } catch (err) {
      return res.status(400).json({ message: "Invalid products JSON" });
    }
  }
  next();
}

module.exports = {
  validateData,
  validateQuery,
  parseMultipartJson,
};
