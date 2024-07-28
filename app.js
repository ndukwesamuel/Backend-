const express = require("express");
require("express-async-errors");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const multer = require("multer");
const { job } = require("./helper");
const connectDB = require("./db/connect");
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  "FLWPUBK_TEST-5efc88def75d1c44d4a4535b31bc4c8a-X",
  "FLWSECK_TEST-67a4462102e95e67069e7f5f98c80369-X"
  // process.env.FLW_PUBLIC_KEY,
  // process.env.FLW_SECRET_KEY
);

// my route start here
const user = require("./Routes/userRoute");
const V1user = require("./Routes/v1/userRoute");
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

const seedRoute = require("./Routes/seedroute");
// ./Routes/seedRoute"); // Add this line

// my route ends here
const notFoundMiddleware = require("./Middleware/not-found");
const errorHandlerMiddleware = require("./Middleware/error-handler");
const { EmailFunction } = require("./utils/EmailFunction");
const sendEmail = require("./utils/sendEmail");
const { Flutterwave_Payment } = require("./services/PaymantService");
const port = process.env.PORT || 5000;

mongoose.set("strictQuery", true);
// mongoose
//   .connect(process.env.MONGO_URS)
//   .then(() => console.log("connected to db"))
//   .catch((err) => console.log(err));

const app = express();
job.start();
app.use(cors());
const httpServer = require("http").Server(app);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// this is the  api route

app.use("/api", Route);
app.use("/api/v1", V1user);
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
app.use("/api/seed", seedRoute); // Add this line

// Route to get all country items
app.get("/api/countries", async (req, res) => {
  try {
    // const payload = {
    //   tx_ref: "MC-158523s09v50343",
    //   order_id: "USS_URG_893982923s2327",
    //   amount: "1500",
    //   currency: "RWF",

    //   email: "olufemi@flw.com",
    //   phone_number: "9167703400",
    //   fullname: "John Madakin",
    // };

    const payload = {
      phone_number: "054709929220",
      amount: 1500,
      currency: "RWF",
      email: "JoeBloggs@acme.co",
      tx_ref: "MC-158523s09v5050e8a",
      order_id: "USS_URG_893982923s2326",
    };

    const response = await flw.MobileMoney.rwanda(payload);
    console.log(response);
    res.json(response);
  } catch (error) {
    console.log(error);
  }
});

app.get("/flutterwave", async (req, res) => {
  res.json({ message: "hello flutterwave get" });
});

app.post("/flutterwave", async (req, res) => {
  res.json({ message: "hello flutterwave post" });
});

app.post("/flw-webhook", async (req, res) => {
  const payload = req.body;
  // console.log(payload);

  let newdata = {
    event: "charge.completed",
    data: {
      id: 6506833,
      tx_ref: "tx_ref-4b01cabf-c600-4636-aa3e-339f1ecf3491-20240728151633-20",
      flw_ref: "flwm3s4m0c1722179804734",
      device_fingerprint: "N/A",
      amount: 20,
      currency: "RWF",
      charged_amount: 20,
      app_fee: 0.58,
      merchant_fee: 0,
      processor_response: "Transaction Successful",
      auth_model: "MOBILEMONEY",
      ip: "52.209.154.143",
      narration: "Samuel Ndukwe 1722077312293",
      status: "successful",
      payment_type: "mobilemoneyrw",
      created_at: "2024-07-28T15:16:44.000Z",
      account_id: 2515122,
      customer: {
        id: 2460221,
        name: "Kaka Kaka",
        phone_number: "0805614811",
        email: "pofow73737@mfunza.com",
        created_at: "2024-07-28T15:16:44.000Z",
      },
    },
    "event.type": "MOBILEMONEYRW_TRANSACTION",
  };

  const payment_service = await Flutterwave_Payment(payload);
  res
    .status(200)
    .json({ message: "hello flutterwave post", data: payment_service });
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

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URS);
    console.log(`DB Connected!`);
    httpServer.listen(port, console.log(`Server is listening at PORT:${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();

// app.listen(process.env.PORT, () => {
//   console.log(`Backend server is running on port ${process.env.PORT}`);
// });
