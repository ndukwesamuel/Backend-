const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const Route = require("./Routes/Route");
const bodyParser = require("body-parser");
const multer = require("multer");

dotenv.config();

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err));

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// this is the  api route
app.use("/api", Route);

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
