const express = require("express");
require("express-async-errors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const bodyParser = require("body-parser");
const multer = require("multer");

// my route start here
const Route = require("./Routes/Route");
const user = require("./Routes/userRoute");
const grouproute = require("./Routes/groupRoute");

// my route ends here
const notFoundMiddleware = require("./Middleware/not-found");
const errorHandlerMiddleware = require("./Middleware/error-handler");

dotenv.config();

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URS)
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err));

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// this is the  api route
app.use("/api", Route);
app.use("/api/user", user);
app.use("/api/group", grouproute);

app.post("/", (req, res) => {
  const { name, email, password } = req.body;

  res.status(200).json({ name, email, password });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.use(function (err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).send({ message: err.message });
  } else if (err) {
    return res.status(400).send({ message: "invalid image type" });
  }
  next();
});

app.listen(process.env.PORT, () => {
  console.log(`Backend server is running on port ${process.env.PORT}`);
});
