const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const Route = require("./Routes/Route");
dotenv.config();

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err));

const app = express();
app.use(cors());
app.use(express.json());

// this is the  api route
app.use("/api", Route);

app.listen(process.env.PORT, () => {
  console.log(`Backend server is running on port ${process.env.PORT}`);
});
