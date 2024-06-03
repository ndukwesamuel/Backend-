const express = require("express");
require("express-async-errors");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const multer = require("multer");
const { job } = require("./helper");
const connectDB = require("./db/connect");

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
const cartHistoryRoute = require("./Routes/cartHistoryRoute");
// my route ends here

const notFoundMiddleware = require("./Middleware/not-found");
const errorHandlerMiddleware = require("./Middleware/error-handler");
const { EmailFunction } = require("./utils/EmailFunction");
const sendEmail = require("./utils/sendEmail");

mongoose.set("strictQuery", true);

const app = express();
job.start();
app.use(cors());
const httpServer = require("http").Server(app);

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
app.use("/api/history", cartHistoryRoute);

// Not Found Middleware
app.use(notFoundMiddleware);

// Error Handling Middleware
app.use(errorHandlerMiddleware);

// Multer Error Handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).send({ message: err.message });
  } else if (err) {
    res.status(400).send({ message: err.message });
  }
  next();
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URS);
    console.log(`DB Connected!`);
    httpServer.listen(process.env.PORT, () => {
      console.log(`Server is listening at PORT:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

start();
