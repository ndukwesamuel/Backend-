const express = require("express");
require("express-async-errors");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const multer = require("multer");
const { job } = require("./helper");
// my route start here
const user = require("./Routes/userRoute");
const grouproute = require("./Routes/groupRoute");
const categoryroute = require("./Routes/categoryroute");
const productroute = require("./Routes/productroute");
const cartRoute = require("./Routes/cartRoute");
const walletRoute = require("./Routes/walletRoute");
const paymentRoute = require("./Routes/paymentRoute");
const Route = require("./Routes/Route");
const orderRoute = require("./Routes/OrderRoute");
const BankRoute = require("./Routes//BankRoute");

// my route ends here
const notFoundMiddleware = require("./Middleware/not-found");
const errorHandlerMiddleware = require("./Middleware/error-handler");

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URS)
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err));

const app = express();
job.start();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// this is the  api route

app.use("/api", Route);
app.use("/api/user", user);
app.use("/api/group", grouproute);
app.use("/api/category", categoryroute);
app.use("/api/products", productroute);
app.use("/api/cart", cartRoute);
app.use("/api/wallet", walletRoute);
app.use("/api/checkout", paymentRoute);
app.use("/api/orders", orderRoute);
app.use("/api/bank", BankRoute);

app.post("/", (req, res) => {
  const { name, email, password } = req.body;

  res.status(200).json({ name, email, password });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.use(function (err, req, res, next) {
  if (err instanceof multer.MulterError) {
    res.status(400).send({ message: err.message });
  } else if (err) {
    res.status(400).send({ message: err.message });
  }
  next();
});

app.listen(process.env.PORT, () => {
  console.log(`Backend server is running on port ${process.env.PORT}`);
});
